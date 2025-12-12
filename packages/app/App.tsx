/**
 * 爱车出海 - React Native App
 */

import React, { useEffect } from 'react'
import { StatusBar, useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootNavigator } from './src/navigation'
import { useUserStore } from './src/stores'

function App() {
  const isDarkMode = useColorScheme() === 'dark'
  const restoreSession = useUserStore((state) => state.restoreSession)

  useEffect(() => {
    // 恢复登录状态
    restoreSession()
  }, [restoreSession])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default App
