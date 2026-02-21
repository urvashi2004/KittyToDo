@echo off
echo Checking for JDK 17...
echo.

if exist "C:\Program Files\Microsoft\jdk-17.*" (
    for /d %%i in ("C:\Program Files\Microsoft\jdk-17.*") do (
        echo Found JDK at: %%i
        echo.
        echo Setting JAVA_HOME...
        setx JAVA_HOME "%%i"
        echo.
        echo Verifying Java version...
        "%%i\bin\java.exe" -version
        echo.
        echo Verifying Java compiler...
        "%%i\bin\javac.exe" -version
        echo.
        echo SUCCESS! Now run: cd android ^&^& gradlew clean assembleDebug
        goto :end
    )
) else (
    echo JDK 17 not found at C:\Program Files\Microsoft\
    echo.
    echo Please install JDK 17 from:
    echo https://aka.ms/download-jdk/microsoft-jdk-17.0.13-windows-x64.msi
)

:end
pause
