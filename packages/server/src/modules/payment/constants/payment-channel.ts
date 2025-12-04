// 支付渠道枚举
export enum PaymentChannel {
    WECHAT = 'wechat',
    ALIPAY = 'alipay',
}

// 客户端类型枚举
export enum ClientType {
    H5 = 'h5',
    PC = 'pc',
    APP = 'app',
}

// 支付渠道中文名称映射
export const PaymentChannelNames: Record<PaymentChannel, string> = {
    [PaymentChannel.WECHAT]: '微信支付',
    [PaymentChannel.ALIPAY]: '支付宝',
}
