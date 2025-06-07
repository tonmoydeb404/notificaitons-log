// android/app/src/main/java/com/notificaiton_log/NotificationModule.kt
package com.notificaiton_log

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private var reactContext: ReactApplicationContext? = null
        
        fun sendNotificationToReactNative(notification: WritableMap) {
            reactContext?.let { context ->
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("NotificationReceived", notification)
            }
        }
    }
    
    init {
        NotificationModule.reactContext = reactContext
    }

    override fun getName(): String = "NotificationModule"

    @ReactMethod
    fun requestPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        try {
            val hasPermission = isNotificationServiceEnabled()
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            val serviceIntent = Intent(reactApplicationContext, MyNotificationListenerService::class.java)
            reactApplicationContext.startService(serviceIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    private fun isNotificationServiceEnabled(): Boolean {
        val packageName = reactApplicationContext.packageName
        val flat = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            "enabled_notification_listeners"
        )
        
        if (!TextUtils.isEmpty(flat)) {
            val names = flat.split(":")
            for (name in names) {
                val cn = ComponentName.unflattenFromString(name)
                if (cn != null && TextUtils.equals(packageName, cn.packageName)) {
                    return true
                }
            }
        }
        return false
    }
}