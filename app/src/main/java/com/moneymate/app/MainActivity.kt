package com.moneymate.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast

@Suppress("DEPRECATION")
class MainActivity : Activity() {
    private lateinit var webView: WebView
    private var pendingSave: ByteArray? = null
    private var fileCallback: ValueCallback<Array<Uri>>? = null

    private val darkBg = Color.rgb(10, 20, 22)
    private val lightBg = Color.rgb(238, 242, 241)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        applyBars(true)

        webView = WebView(this)
        webView.setBackgroundColor(darkBg)
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true          // keep file:// origin so existing MoneyMate data stays readable
            allowContentAccess = false
        }
        // Everything the app needs ships inside the APK. Never navigate anywhere else.
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean =
                request?.url?.scheme != "file"
        }
        webView.webChromeClient = object : WebChromeClient() {
            // Lets the "Restore" button open the system file picker.
            override fun onShowFileChooser(
                view: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                params: WebChromeClient.FileChooserParams?
            ): Boolean {
                if (callback == null) return false
                fileCallback?.onReceiveValue(null)
                fileCallback = callback
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
                return try {
                    startActivityForResult(Intent.createChooser(intent, "Choose a MoneyMate backup"), REQ_PICK)
                    true
                } catch (e: Exception) {
                    fileCallback = null
                    false
                }
            }
        }
        webView.addJavascriptInterface(Bridge(), "AndroidBridge")

        // Keep content clear of the status bar, navigation bar and keyboard (Android 15 draws edge-to-edge).
        webView.setOnApplyWindowInsetsListener { v, insets ->
            if (Build.VERSION.SDK_INT >= 30) {
                val b = insets.getInsets(WindowInsets.Type.systemBars() or WindowInsets.Type.ime())
                v.setPadding(b.left, b.top, b.right, b.bottom)
            } else {
                v.setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
            }
            insets
        }
        setContentView(webView)
        webView.loadUrl("file:///android_asset/index.html")
    }

    private fun applyBars(dark: Boolean) {
        val bg = if (dark) darkBg else lightBg
        window.decorView.setBackgroundColor(bg)
        window.statusBarColor = bg
        window.navigationBarColor = bg
        if (Build.VERSION.SDK_INT >= 23) {
            var flags = window.decorView.systemUiVisibility
            flags = if (dark) flags and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv() else flags or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            if (Build.VERSION.SDK_INT >= 26) {
                flags = if (dark) flags and View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv() else flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            }
            window.decorView.systemUiVisibility = flags
        }
        if (::webView.isInitialized) webView.setBackgroundColor(bg)
    }

    /** Methods the web app can call. Only local, bundled pages are ever loaded, so this surface is not reachable from the web. */
    inner class Bridge {
        @JavascriptInterface
        fun saveFile(name: String, mime: String, content: String) {
            runOnUiThread {
                pendingSave = content.toByteArray(Charsets.UTF_8)
                val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = mime
                    putExtra(Intent.EXTRA_TITLE, name)
                }
                try {
                    startActivityForResult(intent, REQ_SAVE)
                } catch (e: Exception) {
                    pendingSave = null
                    Toast.makeText(this@MainActivity, "No app available to save files", Toast.LENGTH_LONG).show()
                }
            }
        }

        @JavascriptInterface
        fun setTheme(dark: Boolean) { runOnUiThread { applyBars(dark) } }

        @JavascriptInterface
        fun setSecure(on: Boolean) {
            runOnUiThread {
                if (on) window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
                else window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        when (requestCode) {
            REQ_PICK -> {
                val result = if (resultCode == RESULT_OK) WebChromeClient.FileChooserParams.parseResult(resultCode, data) else null
                fileCallback?.onReceiveValue(result)
                fileCallback = null
            }
            REQ_SAVE -> {
                val uri = data?.data
                val bytes = pendingSave
                pendingSave = null
                if (resultCode == RESULT_OK && uri != null && bytes != null) {
                    try {
                        contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
                        Toast.makeText(this, "File saved", Toast.LENGTH_SHORT).show()
                    } catch (e: Exception) {
                        Toast.makeText(this, "Could not save the file", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    // Pausing the WebView makes Android flush localStorage to disk when the app goes to the background.
    override fun onPause() { super.onPause(); webView.onPause() }
    override fun onResume() { super.onResume(); webView.onResume() }

    override fun onBackPressed() {
        // Let the web app close sheets / go back a screen first; exit only from the home screen.
        webView.evaluateJavascript("(window.__mmBack ? window.__mmBack() : false)") { handled ->
            if (handled != "true") finish()
        }
    }

    companion object {
        private const val REQ_PICK = 1001
        private const val REQ_SAVE = 1002
    }
}
