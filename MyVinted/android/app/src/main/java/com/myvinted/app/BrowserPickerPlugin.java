package com.myvinted.app;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;

@CapacitorPlugin(name = "BrowserPicker")
public class BrowserPickerPlugin extends Plugin {

    @PluginMethod
    public void list(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.vinted.fr"));
        PackageManager pm = getContext().getPackageManager();
        List<ResolveInfo> apps = pm.queryIntentActivities(intent, PackageManager.MATCH_ALL);
        JSArray arr = new JSArray();
        for (ResolveInfo info : apps) {
            JSObject o = new JSObject();
            o.put("package", info.activityInfo.packageName);
            o.put("name", info.loadLabel(pm).toString());
            arr.put(o);
        }
        JSObject res = new JSObject();
        res.put("browsers", arr);
        call.resolve(res);
    }

    @PluginMethod
    public void open(PluginCall call) {
        String url = call.getString("url");
        if (url == null) { call.reject("url manquante"); return; }
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        String pkg = call.getString("package");
        if (pkg != null) intent.setPackage(pkg);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Impossible d'ouvrir : " + e.getMessage());
        }
    }
}