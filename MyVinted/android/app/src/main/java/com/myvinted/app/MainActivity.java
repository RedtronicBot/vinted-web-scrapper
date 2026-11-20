package com.myvinted.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BrowserPickerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
