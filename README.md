# MoneyMate Android

A dark, offline-first personal finance tracker for Android. Supports Bahraini Dinar (BHD) and Indian Rupee (INR), manual exchange-rate conversion, income/expense entries, category budgets, savings goals, CSV export, and JSON backup/restore.

## Build the APK
1. Install Android Studio (current stable) and Android SDK Platform 35.
2. Open this `MoneyMate` folder in Android Studio.
3. Allow Gradle sync to download the Android Gradle Plugin/Kotlin plugin.
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Android Studio will create the debug APK under `app/build/outputs/apk/debug/app-debug.apk`.

## Privacy and limitations
- All finance records are stored in the app's local WebView storage. No network permission or bank connection is included.
- Uninstalling the app or clearing its storage can erase records. Use Settings > Backup data regularly.
- The BHD/INR rate is a manually editable estimate (default 1 BHD = 240 INR (approximate; update it in Settings)), not a live exchange quote.
- This is a personal expense tracker, not a bank, investment, tax, or accounting service.

## Build APK directly with GitHub Actions (no Android Studio needed)

1. Create or open your GitHub repository.
2. Upload **the contents of this ZIP** to the repository root (so `app/`, `build.gradle`, `settings.gradle`, and `.github/` are at the top level).
3. Commit the files to the `main` branch.
4. Open the repository's **Actions** tab and select **Build MoneyMate APK**.
5. Wait for the workflow to finish successfully.
6. Open the completed workflow run and download the **MoneyMate-debug-apk** artifact. It contains `app-debug.apk`.

You can also run the workflow manually from Actions > Build MoneyMate APK > Run workflow.

## App icon

- `assets/moneymate-app-icon.png` is the full-size app icon artwork.
- Android launcher icon sizes and the adaptive icon declaration are included under `app/src/main/res/`.

## Build configuration note

Java source/target compatibility and Kotlin JVM target are both set to Java 17
to avoid the `Inconsistent JVM-target compatibility` error in GitHub Actions.

## Launcher icon fix (v1.0.1)

The adaptive launcher icon now uses a dedicated `drawable/ic_launcher_foreground.png`
resource and a separate background color. This avoids the previous self-reference
between `mipmap/ic_launcher.xml` and `mipmap/ic_launcher.png`. Version code is bumped
to 2 so the new APK can update the installed app.

## Launcher icon correction (v1.0.2)

The Android 8+ adaptive icon now references a dedicated vector drawable
(`drawable/ic_launcher_foreground.xml`) rather than referencing the launcher
mipmap itself. This removes the recursive resource reference that caused the
generic Android robot icon to appear. Legacy PNG launcher icons remain included.

## Premium launcher artwork (v1.0.3)

Added the premium MoneyMate wallet/coins/growth artwork as the Android launcher
foreground and as a full-size brand asset in `assets/`. The adaptive icon points
to `@drawable/ic_launcher_foreground`; legacy launcher density PNGs are updated.
The version code is incremented to 4 for installing this build as an app update.

## User-selected launcher icon (v1.0.4)

The launcher icon has been replaced with the exact wallet image supplied by the
user. The source crop is included at `assets/moneymate-user-selected-icon.png`.
Adaptive and legacy density launcher resources are updated. Version code is 5
so this APK can update the already installed MoneyMate app.
