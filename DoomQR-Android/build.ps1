$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$sdk = Join-Path (Split-Path -Parent $root) 'sdk'
$bt = Join-Path $sdk 'build-tools\34.0.0'
$androidJar = Join-Path $sdk 'platforms\android-34\android.jar'
$work = Join-Path $root 'build'
$java = (Get-Command java).Source
$javac = Join-Path (Split-Path (Split-Path $java)) 'bin\javac.exe'
$keytool = Join-Path (Split-Path (Split-Path $java)) 'bin\keytool.exe'

New-Item -ItemType Directory -Force -Path $work | Out-Null
Set-Location $work

Write-Host '--- compiling resources ---'
& "$bt\aapt2.exe" compile --dir "$root\res" -o "$work\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 compile failed' }

Write-Host '--- linking resources ---'
& "$bt\aapt2.exe" link -o "$work\base.apk" -I $androidJar --manifest "$root\AndroidManifest.xml" -R "$work\res.zip" -A "$root\assets" --auto-add-overlay --java "$work\gen" --min-sdk-version 21 --target-sdk-version 34
if ($LASTEXITCODE) { throw 'aapt2 link failed' }

Write-Host '--- compiling Java ---'
New-Item -ItemType Directory -Force -Path "$work\classes", "$work\tools" | Out-Null
$generated = Get-ChildItem "$work\gen" -Recurse -Filter *.java -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
& $javac -proc:none -source 8 -target 8 -bootclasspath $androidJar -cp $androidJar -d "$work\classes" "$root\src\com\ashish\doomqr\MainActivity.java" $generated
if ($LASTEXITCODE) { throw 'javac failed' }
& $javac -d "$work\tools" "$root\AddDex.java"
if ($LASTEXITCODE) { throw 'AddDex compile failed' }

Write-Host '--- dexing ---'
& "$bt\d8.bat" --lib $androidJar --output "$work" (Get-ChildItem "$work\classes" -Recurse -Filter *.class | ForEach-Object { $_.FullName })
if ($LASTEXITCODE -or -not (Test-Path "$work\classes.dex")) { throw 'd8 failed' }

Write-Host '--- packaging dex ---'
& $java -cp "$work\tools" AddDex "$work\base.apk" "$work\classes.dex" "$work\unaligned.apk"
if ($LASTEXITCODE) { throw 'dex packaging failed' }

Write-Host '--- aligning ---'
& "$bt\zipalign.exe" -f -p 4 "$work\unaligned.apk" "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'zipalign failed' }

Write-Host '--- signing ---'
if (-not (Test-Path "$work\debug.jks")) {
  & $keytool -genkeypair -keystore "$work\debug.jks" -storepass android -keypass android -alias androiddebugkey -dname "CN=Android Debug,O=Android,C=US" -keyalg RSA -keysize 2048 -validity 10000
}
& "$bt\apksigner.bat" sign --ks "$work\debug.jks" --ks-pass pass:android --key-pass pass:android --out "$root\DOOMQR.apk" "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'apksigner failed' }

Write-Host "DONE: $root\DOOMQR.apk"
Get-Item "$root\DOOMQR.apk" | Select-Object FullName, Length
