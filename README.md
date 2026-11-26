# MoneyMate 2.0

A private, offline money manager for Android, built for people who earn in one currency and save or send money in another (for example BHD and INR).

## What it does
- **Accounts** in any currency (bank, savings, cash, card, wallet) with a combined net worth in your main currency
- **Income, expenses and transfers.** Transfers between currencies record the amount actually received, so remittances keep their real rate
- **Monthly budgets** with over-limit warnings, **savings goals** with a monthly target, and **recurring items** (rent, salary, subscriptions) recorded automatically
- **Insights:** spending by category, six-month income vs spending, largest expenses, savings rate, average rate on money sent abroad
- **Privacy:** optional PIN lock, hide balances, hide contents in recent apps and block screenshots
- **Data ownership:** CSV export, JSON backup and restore through the Android file picker, undo on delete
- Light, dark or automatic theme. Works with no internet and has no network permission.

## Upgrading from v1
Existing v1 data is migrated automatically the first time v2 opens (the old record is left untouched). Because v1 had no accounts, one account per currency is created ("Main account", "India account") starting at zero. Open each in Settings > Accounts and enter its real starting balance.

## Project layout
```
app/src/main/assets/
  index.html          shell
  css/styles.css      themes and components
  js/core.js          data model, FX, migration, recurring engine, export (no UI)
  js/charts.js        inline-SVG donut, bars, currency strip
  js/app.js           screens, forms, lock, onboarding
app/src/main/java/com/moneymate/app/MainActivity.kt
                      WebView host: file save/restore, back button, system-bar insets, theme bars, screen protection
```

## Build the APK
1. Install Android Studio (current stable) and Android SDK Platform 35.
2. Open this `MoneyMate` folder in Android Studio.
3. Allow Gradle sync to download the Android Gradle Plugin/Kotlin plugin.
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Android Studio will create the debug APK under `app/build/outputs/apk/debug/app-debug.apk`.

## Privacy and limitations
- All records are stored in the app's local WebView storage. There is no network permission, account, bank connection or analytics.
- Uninstalling or clearing app data erases records. Use Settings > Back up regularly; the app reminds you after 30 days.
- Exchange rates are estimates you edit in Settings. They are never fetched live.
- The PIN is a privacy lock for the app screen, not encryption of the stored data.
- A personal tracker, not a bank, tax or accounting service.

## Build APK directly with GitHub Actions (no Android Studio needed)

1. Create or open your GitHub repository.
2. Upload **the contents of this ZIP** to the repository root (so `app/`, `build.gradle`, `settings.gradle`, and `.github/` are at the top level).
3. Commit the files to the `main` branch.
4. Open the repository's **Actions** tab and select **Build MoneyMate APK**.
5. Wait for the workflow to finish successfully.
6. Open the completed workflow run and download the **MoneyMate-debug-apk** artifact. It contains `app-debug.apk`.

You can also run the workflow manually from Actions > Build MoneyMate APK > Run workflow.

