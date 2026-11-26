package com.ashish.doomqr;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.provider.OpenableColumns;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final int REQ_MUSIC = 1001;
    private static final String PREFS = "doomqr_prefs";
    private static final String KEY_SAVE = "save";
    private static final String KEY_META = "meta";

    private WebView web;
    private MediaPlayer player;
    private Uri musicUri;
    private String musicName = "";
    private float musicVolume = 1f;
    private AudioManager audioManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

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

    // ---------- persistent progress / meta ----------
    @JavascriptInterface
    public void saveGame(String json) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEY_SAVE, json).apply();
    }

    @JavascriptInterface
    public String loadGame() {
        return getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_SAVE, "");
    }

    @JavascriptInterface
    public void setMeta(String json) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEY_META, json).apply();
    }

    @JavascriptInterface
    public String getMeta() {
        return getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_META, "");
    }

    @JavascriptInterface
    public void vibrate(int ms) {
        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (v == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            v.vibrate(android.os.VibrationEffect.createOneShot(ms, android.os.VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            v.vibrate(ms);
        }
    }

    // ---------- music ----------
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

    @JavascriptInterface
    public void playMusic() {
        if (player != null && !player.isPlaying()) {
            try { player.start(); } catch (Exception ignored) {}
        }
    }

    @JavascriptInterface
    public void pauseMusic() {
        if (player != null && player.isPlaying()) player.pause();
    }

    @JavascriptInterface
    public void setMusicVolume(float v) {
        musicVolume = Math.max(0f, Math.min(1f, v));
        if (player != null) player.setVolume(musicVolume, musicVolume);
    }

    @JavascriptInterface
    public String musicName() {
        return musicName;
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
            musicUri = uri;
            musicName = displayName(uri);
            if (player != null) {
                player.release();
                player = null;
            }
            player = new MediaPlayer();
            player.setDataSource(this, uri); // stream directly; no big file copy
            player.setLooping(true);
            player.setVolume(musicVolume, musicVolume);
            player.prepare();
            requestAudioFocus();
            player.start();
            web.evaluateJavascript("window.musicLoaded && window.musicLoaded("
                    + jsonString(musicName) + ")", null);
        } catch (Exception e) {
            Toast.makeText(this, "Could not play that song: " + e.getMessage(),
                    Toast.LENGTH_LONG).show();
        }
    }

    private String displayName(Uri uri) {
        String name = "Song";
        Cursor c = getContentResolver().query(uri, null, null, null, null);
        if (c != null) {
            try {
                int i = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (i >= 0 && c.moveToFirst()) name = c.getString(i);
            } finally {
                c.close();
            }
        }
        return name;
    }

    private static String jsonString(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioFocusRequest afr = new AudioFocusRequest.Builder(
                    AudioManager.AUDIOFOCUS_GAIN)
                    .setOnAudioFocusChangeListener(focusListener)
                    .build();
            audioManager.requestAudioFocus(afr);
        } else {
            audioManager.requestAudioFocus(focusListener,
                    AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }
    }

    private final AudioManager.OnAudioFocusChangeListener focusListener =
            new AudioManager.OnAudioFocusChangeListener() {
                @Override
                public void onAudioFocusChange(int change) {
                    if (player == null) return;
                    if (change == AudioManager.AUDIOFOCUS_LOSS
                            || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                        player.pause();
                    } else if (change == AudioManager.AUDIOFOCUS_GAIN) {
                        try { player.start(); } catch (Exception ignored) {}
                    }
                }
            };

    @Override
    protected void onDestroy() {
        if (player != null) {
            player.release();
            player = null;
        }
        super.onDestroy();
    }
}
