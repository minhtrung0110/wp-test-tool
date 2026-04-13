; =============================================================================
;  WP Test Tool — Custom NSIS include
;  File: build/installer.nsh
;
;  electron-builder !includes this file near the top of the generated
;  installer.nsi, before MUI pages are declared and sections are compiled.
;
;  Macros recognised by electron-builder's NSIS template:
;    customInit       — called inside .onInit
;    customInstall    — called at the end of the Install section
;    customUnInstall  — called at the end of the Uninstall section
; =============================================================================

; ── MUI page text ─────────────────────────────────────────────────────────────
; These !defines must appear before electron-builder inserts the MUI_PAGE_*
; macros, which is guaranteed because this file is !included first.

!define MUI_WELCOMEPAGE_TITLE "Welcome to WP Test Tool Setup"
!define MUI_WELCOMEPAGE_TEXT  "This wizard will guide you through the \
installation of WP Test Tool on your computer.$\r$\n$\r$\n\
It is recommended that you close all other applications \
before continuing.$\r$\n$\r$\nClick Next to continue."

!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Are you sure you want to quit WP Test Tool Setup?"

!define MUI_FINISHPAGE_TITLE "WP Test Tool Setup Complete"
!define MUI_FINISHPAGE_TEXT  "WP Test Tool has been successfully installed.$\r$\n$\r$\n\
Click Finish to close the Setup Wizard."


; ── customInit ────────────────────────────────────────────────────────────────
; Sets a clean default installation directory.
; electron-builder calls !insertmacro customInit inside .onInit, before the
; directory page is shown, so the Browse dialog opens pointing here by default.
; ─────────────────────────────────────────────────────────────────────────────
!macro customInit
  ; Default to the 64-bit Program Files folder.
  ; The directory page lets the user browse to a different location.
  StrCpy $INSTDIR "$PROGRAMFILES64\WP Test Tool"
!macroend


; ── customInstall ─────────────────────────────────────────────────────────────
; Runs at the end of the Install section, after all files have been written.
; Registers the executable in the Windows App Paths registry key so the app
; can be launched from the Run dialog (Win+R) by typing its name.
; ─────────────────────────────────────────────────────────────────────────────
!macro customInstall
  ; Register in App Paths (HKLM — requires the admin elevation we already have)
  WriteRegStr HKLM \
    "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\${APP_EXECUTABLE_FILENAME}" \
    "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKLM \
    "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\${APP_EXECUTABLE_FILENAME}" \
    "Path" "$INSTDIR"
!macroend


; ── customUnInstall ───────────────────────────────────────────────────────────
; Runs at the end of the Uninstall section.
; Removes any registry keys added during install that electron-builder does
; not automatically clean up.
; ─────────────────────────────────────────────────────────────────────────────
!macro customUnInstall
  ; Remove the App Paths registration written above
  DeleteRegKey HKLM \
    "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\${APP_EXECUTABLE_FILENAME}"
!macroend
