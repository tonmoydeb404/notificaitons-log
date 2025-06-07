// android/app/src/main/java/com/notificaiton_log/MyNotificationListenerService.kt
package com.notificaiton_log

import android.app.Notification
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

class MyNotificationListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        // Extract notification data
        val notification = sbn.notification
        val packageName = sbn.packageName
        
        // Skip our own notifications
        if (packageName == this.packageName) {
            return
        }

        // Create data to send to React Native
        val notificationData = Arguments.createMap().apply {
            putString("id", sbn.key)
            putString("packageName", packageName)
            putString("appName", getAppName(packageName))
            putDouble("timestamp", sbn.postTime.toDouble())
            
            // Extract text content
            notification.extras?.let { extras ->
                val title = extras.getCharSequence("android.title")
                val text = extras.getCharSequence("android.text")
                val bigText = extras.getCharSequence("android.bigText")
                
                putString("title", title?.toString() ?: "")
                putString("text", text?.toString() ?: "")
                putString("bigText", bigText?.toString() ?: "")
            }

            putInt("priority", notification.priority)
            putString("category", notification.category)
            putBoolean("ongoing", (notification.flags and Notification.FLAG_ONGOING_EVENT) != 0)
        }

        // Send to React Native through the module
        NotificationModule.sendNotificationToReactNative(notificationData)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Handle notification removal if needed
    }

    private fun getAppName(packageName: String): String {
        return try {
            val pm = packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }
    }
}