// 支付状态枚举
export enum PaymentStatus {
    PENDING = 'pending',     // 待支付
    PAID = 'paid',           // 已支付
    CLOSED = 'closed',       // 已关闭（超时/取消）
    REFUNDED = 'refunded',   // 已退款
}

// 支付日志操作类型
export enum PaymentLogAction {
    CREATE = 'create',       // 创建支付订单
    CALLBACK = 'callback',   // 支付回调
    QUERY = 'query',         // 主动查询
    REFUND = 'refund',       // 退款
    CLOSE = 'close',         // 关闭订单
}

// 状态转换规则：定义每个状态可以转换到哪些状态
export const PaymentStatusTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [PaymentStatus.PAID, PaymentStatus.CLOSED],
    [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
    [PaymentStatus.CLOSED]: [],
    [PaymentStatus.REFUNDED]: [],
}

// 检查状态转换是否合法
export function canTransitionTo(from: PaymentStatus, to: PaymentStatus): boolean {
    return PaymentStatusTransitions[from]?.includes(to) ?? false
}
