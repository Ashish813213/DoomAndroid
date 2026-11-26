package com.ashish.doomqr;

import android.app.Activity;
import android.content.Intent;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private static final int REQ_MUSIC = 1001;
    private static final String PREFS = "doomqr_state";
    private static final String KEY_SAVE = "save";

    private WebView web;
    private MediaPlayer player;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        setContentView(web);

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(this, "Android");
        web.loadUrl("file:///android_asset/index.html");
    }

    /** Persistent progress save, called from the game page. */
    @JavascriptInterface
    public void saveGame(String json) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEY_SAVE, json).apply();
    }

    /** Returns the saved state, or an empty string if none exists. */
    @JavascriptInterface
    public String loadGame() {
        return getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_SAVE, "");
    }

    /** Called by the MUSIC button in the page. */
    @JavascriptInterface
    public void pickMusic() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.setType("audio/*");
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                        | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                startActivityForResult(intent, REQ_MUSIC);
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQ_MUSIC || resultCode != RESULT_OK
                || data == null || data.getData() == null) return;

        Uri uri = data.getData();
        try {
            getContentResolver().takePersistableUriPermission(
                    uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);

            File local = new File(getCacheDir(), "background-song");
            InputStream in = getContentResolver().openInputStream(uri);
            OutputStream out = new FileOutputStream(local);
            try {
                byte[] buffer = new byte[8192];
                int n;
                while ((n = in.read(buffer)) > 0) out.write(buffer, 0, n);
            } finally {
                in.close();
                out.close();
            }

            if (player != null) {
                player.release();
                player = null;
            }
            player = new MediaPlayer();
            player.setDataSource(local.getAbsolutePath());
            player.setLooping(true);
            player.prepare();
            player.start();

            web.evaluateJavascript("window.musicLoaded && window.musicLoaded()", null);
        } catch (Exception e) {
            Toast.makeText(this, "Could not play that song: " + e.getMessage(),
                    Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onDestroy() {
        if (player != null) {
            player.release();
            player = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        // The game has no menus; keep the app simple.
        super.onBackPressed();
    }
}
