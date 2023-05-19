import { Inject, Provide, Config } from '@midwayjs/decorator';
import {
  BaseService,
  CoolEventManager,
  CoolCommException,
} from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { OrderInfoEntity } from '../entity/info';
import { OrderGoodsEntity } from '../entity/goods';
import { ICoolWxPay } from '@cool-midway/wxpay';
import { UserInfoEntity } from '../../user/entity/info';
import { parseString } from 'xml2js';
import { GoodsSpecsInfoEntity } from '../../goods/entity/specs/info';
import * as MyBigNumber from 'my-bignumber';
import { GoodsInfoEntity } from '../../goods/entity/info';
import { Context } from 'egg';

/**
 * 描述
 */
@Provide()
export class OrderPayService extends BaseService {
  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(GoodsSpecsInfoEntity)
  goodsSpecsInfoEntity: Repository<GoodsSpecsInfoEntity>;

  @InjectEntityModel(GoodsInfoEntity)
  goodsInfoEntity: Repository<GoodsInfoEntity>;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;

  // 微信支付
  @Inject('wxpay:sdk')
  wxPay: ICoolWxPay;

  @Config('module.order')
  config;

  @Config('module.user')
  userConfig;

  @Inject()
  ctx: Context;

  /**
   * 退款
   * @param orderGoodsId 订单商品ID
   */
  async refund(orderGoodsId: number) {
    const info = await this.orderGoodsEntity.findOne({
      id: orderGoodsId,
    });
    if (info) {
      // 查询对应的订单， 看下支付方式
      const order = await this.orderInfoEntity.findOne({
        id: info.orderId,
      });
      // 微信退款
      if (order && order.payType == 0) {
        // 初始化微信api
        const wxPay = await this.wxPay.initPay({
          appid: this.config.wx.mp.appid,
          ...this.config.wx.pay,
        });
        // const result = await wxPay.getInstance().refund({
        const result = await wxPay.refund({
          out_trade_no: order.orderNum,
          out_refund_no: `refund-${order.orderNum}-${info.id}`,
          total_fee: MyBigNumber.mul(order.price, 100),
          // refund_fee: MyBigNumber.mul(
          //   MyBigNumber.minus(
          //     MyBigNumber.mul(info.price, info.goodsCount),
          //     info.discountPrice
          //   ),
          //   100
          // ),
          refund_fee: MyBigNumber.mul(info.refundAmount, 100),
          // total_fee: 1,
          // refund_fee: 1,
        });
        if (result.result_code != 'SUCCESS') {
          throw new CoolCommException(`退款失败，${result.return_msg}`);
        }
      }
    }
  }

  /**
   * 微信JSSDK支付参数(自动下单, 兼容小程序)
   *
   */
  async wxJSApi(orderId: number) {
    // 根据订单获取订单价格用户openId
    const order = await this.orderInfoEntity.findOne({ id: orderId });
    const user = await this.userInfoEntity.findOne({ id: order.userId });
    const wxPay = await this.wxPay.initPay({
      appid: this.config.wx.mp.appid,
      ...this.config.wx.pay,
    });
    if (!user.mpOpenid) {
      throw new CoolCommException('请绑定微信号！！');
    }
    const result = await wxPay.getPayParams({
      out_trade_no: order.orderNum, // 商品订单
      body: '商品简单描述',
      total_fee: MyBigNumber.mul(order.price, 100),
      // 商品价格
      // total_fee: 1, // 商品价格
      openid: user.mpOpenid, //付款用户的openid
    });

    return result;
  }
  /**
   * 微信H5支付
   * @param query
   * @returns
   */
  async wxH5Pay(query: any) {
    const { orderId, url, signature } = query;
    const order = await this.orderInfoEntity.findOne({ id: orderId });
    const wxPay = await this.wxPay.initPay({
      appid: this.config.wx.mp.appid,
      ...this.config.wx.pay,
    });

    const result = await wxPay.unifiedOrder({
      out_trade_no: order.orderNum,
      body: '闪酷商城-购买',
      description: 'COOL-UNI ',
      // total_fee: 1,
      sign: signature,
      total_fee: MyBigNumber.mul(order.price, 100),
      trade_type: 'MWEB',
      product_id: 'test001',
      scene_info: JSON.stringify({
        h5_info: {
          type: 'Wap',
          wap_url: url,
          wap_name: '酷卖',
        },
      }),
    });
    return result;
  }

  /**
   * 微信小程序支付
   * @param orderId
   */
  async wxMiniPay(orderId) {
    const order = await this.orderInfoEntity.findOne({ id: orderId });
    const user = await this.userInfoEntity.findOne({ id: order.userId });
    const wxPay = await this.wxPay.initPay({
      appid: this.userConfig.wx.mini.appid,
      ...this.config.wx.pay,
    });
    const params = await wxPay.getPayParams({
      openid: user.miniOpenid,
      out_trade_no: order.orderNum,
      body: '账号充值',
      description: 'COOL-UNI ',
      total_fee: MyBigNumber.mul(order.price, 100),
    });
    return params;
  }

  /**
   * 微信支付通知回调
   */
  async wxNotify() {
    let data = '';
    this.ctx.req.setEncoding('utf8');
    this.ctx.req.on('data', chunk => {
      data += chunk;
    });

    const results = await new Promise((resolve, reject) => {
      this.ctx.req.on('end', () => {
        parseString(data, { explicitArray: false }, async (err, json) => {
          if (err) {
            return reject('success');
          }
          const wxPay = await this.wxPay.initPay({
            appid: json.xml.appid,
            ...this.config.wx.pay,
          });
          const checkSign = await wxPay._getSign(json.xml, 'MD5');
          if (
            checkSign == json.xml.sign &&
            json.xml.result_code === 'SUCCESS'
          ) {
            // 处理业务逻辑
            // 根据订单编号查询订单
            const order = await this.orderInfoEntity.findOne({
              orderNum: json.xml.out_trade_no,
            });
            // 发送订单已支付事件
            this.coolEventManager.emit('orderPayed', order);
            this.orderInfoEntity.update(
              { id: order.id },
              { status: 1, payType: 0 }
            );
            return resolve(true);
          }
          return resolve(false);
        });
      });
    });

    if (results) {
      this.ctx.body =
        '<xml><return_msg>OK</return_msg><return_code>SUCCESS</return_code></xml>';
    }
  }
}
