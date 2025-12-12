import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { theme, colors, spacing } from '../theme'
import { useUserStore } from '../stores'
import { authApi } from '../api'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function LoginScreen() {
    const navigation = useNavigation<NavigationProp>()
    const { login, loading } = useUserStore()

    const [mobile, setMobile] = useState('')
    const [code, setCode] = useState('')
    const [countdown, setCountdown] = useState(0)
    const [sendingCode, setSendingCode] = useState(false)

    // 验证码倒计时
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    // 验证手机号格式
    const isValidMobile = useCallback((phone: string) => {
        return /^1[3-9]\d{9}$/.test(phone)
    }, [])

    // 发送验证码
    const handleSendCode = async () => {
        if (!isValidMobile(mobile)) {
            Alert.alert('提示', '请输入正确的手机号')
            return
        }

        if (countdown > 0) return

        setSendingCode(true)
        try {
            await authApi.sendCode(mobile)
            setCountdown(60)
            Alert.alert('提示', '验证码已发送')
        } catch (error) {
            Alert.alert('错误', '验证码发送失败，请稍后重试')
        } finally {
            setSendingCode(false)
        }
    }

    // 登录
    const handleLogin = async () => {
        if (!isValidMobile(mobile)) {
            Alert.alert('提示', '请输入正确的手机号')
            return
        }

        if (code.length !== 6) {
            Alert.alert('提示', '请输入6位验证码')
            return
        }

        try {
            await login(mobile, code)
            navigation.goBack()
        } catch (error) {
            Alert.alert('登录失败', '验证码错误或已过期')
        }
    }

    const canSendCode = isValidMobile(mobile) && countdown === 0 && !sendingCode
    const canLogin = isValidMobile(mobile) && code.length === 6 && !loading

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo 区域 */}
                <View style={styles.logoSection}>
                    <Text style={styles.logo}>🚗</Text>
                    <Text style={styles.title}>爱车出海</Text>
                    <Text style={styles.subtitle}>全球二手车交易平台</Text>
                </View>

                {/* 表单区域 */}
                <View style={styles.form}>
                    {/* 手机号输入 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>手机号</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="请输入手机号"
                            placeholderTextColor={colors.textLight}
                            keyboardType="phone-pad"
                            maxLength={11}
                            value={mobile}
                            onChangeText={setMobile}
                        />
                    </View>

                    {/* 验证码输入 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>验证码</Text>
                        <View style={styles.codeRow}>
                            <TextInput
                                style={[styles.input, styles.codeInput]}
                                placeholder="请输入验证码"
                                placeholderTextColor={colors.textLight}
                                keyboardType="number-pad"
                                maxLength={6}
                                value={code}
                                onChangeText={setCode}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.codeButton,
                                    !canSendCode && styles.codeButtonDisabled,
                                ]}
                                onPress={handleSendCode}
                                disabled={!canSendCode}
                            >
                                {sendingCode ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Text
                                        style={[
                                            styles.codeButtonText,
                                            !canSendCode && styles.codeButtonTextDisabled,
                                        ]}
                                    >
                                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 登录按钮 */}
                    <TouchableOpacity
                        style={[styles.loginButton, !canLogin && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={!canLogin}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Text style={styles.loginButtonText}>登录</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* 协议提示 */}
                <Text style={styles.agreement}>
                    登录即表示同意《用户协议》和《隐私政策》
                </Text>
            </View>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logo: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: theme.fontSize.sm,
        color: colors.textSecondary,
    },
    form: {
        marginBottom: spacing.xl,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '500',
    },
    input: {
        height: 48,
        backgroundColor: colors.white,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: spacing.md,
        fontSize: theme.fontSize.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeInput: {
        flex: 1,
        marginRight: spacing.sm,
    },
    codeButton: {
        height: 48,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 110,
    },
    codeButtonDisabled: {
        backgroundColor: colors.border,
    },
    codeButtonText: {
        fontSize: theme.fontSize.sm,
        color: colors.white,
        fontWeight: '500',
    },
    codeButtonTextDisabled: {
        color: colors.textLight,
    },
    loginButton: {
        height: 50,
        backgroundColor: colors.primary,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    loginButtonDisabled: {
        backgroundColor: colors.border,
    },
    loginButtonText: {
        fontSize: theme.fontSize.md,
        color: colors.white,
        fontWeight: 'bold',
    },
    agreement: {
        fontSize: theme.fontSize.xs,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
})
