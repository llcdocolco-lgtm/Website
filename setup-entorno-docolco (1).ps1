# =============================================================
# Docolco Image Manager — Preparacion del entorno
# Windows 11 · Ejecutar en PowerShell como Administrador
# =============================================================

$REPO = "C:\Users\Plasfilm\Downloads\edicion docolco website"
$GITHUB = "https://github.com/llcdocolco-lgtm/Website"

# =============================================================
# PASO 1 — Verificar Python
# =============================================================
Write-Host "[ 1/8 ] Verificando Python..." -ForegroundColor Cyan
try {
    $pyver = python --version 2>&1
    Write-Host "        OK: $pyver" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "  ERROR: Python no esta instalado." -ForegroundColor Red
    Write-Host "  Instalar desde: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  IMPORTANTE: marcar 'Add Python to PATH' durante la instalacion."
    Write-Host ""
    Read-Host "  Presiona Enter para salir. Vuelve a correr este script despues de instalar Python"
    exit
}

# =============================================================
# PASO 2 — Verificar o instalar Git
# =============================================================
Write-Host "[ 2/8 ] Verificando Git..." -ForegroundColor Cyan
try {
    $gitver = git --version 2>&1
    Write-Host "        OK: $gitver" -ForegroundColor Green
} catch {
    Write-Host "        Git no encontrado. Descargando instalador..." -ForegroundColor Yellow
    $gitInstaller = "$env:TEMP\git-installer.exe"
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.45.2.windows.1/Git-2.45.2-64-bit.exe" -OutFile $gitInstaller
    Write-Host "        Instalando Git (acepta todos los defaults)..."
    Start-Process -FilePath $gitInstaller -Args "/VERYSILENT /NORESTART" -Wait
    $env:PATH += ";C:\Program Files\Git\cmd"
    Write-Host "        OK: Git instalado." -ForegroundColor Green
}

# =============================================================
# PASO 3 — Configurar identidad Git
# =============================================================
Write-Host "[ 3/8 ] Configurando identidad Git..." -ForegroundColor Cyan
git config --global user.name "Docolco"
git config --global user.email "info@docolco.com"
git config --global core.autocrlf true
Write-Host "        OK" -ForegroundColor Green

# =============================================================
# PASO 4 — Vincular carpeta local al repo de GitHub
# =============================================================
Write-Host "[ 4/8 ] Vinculando repo local con GitHub..." -ForegroundColor Cyan
Set-Location $REPO

# Inicializar git si no tiene .git
if (-not (Test-Path "$REPO\.git")) {
    git init
    git remote add origin $GITHUB
    Write-Host "        Repo inicializado y vinculado." -ForegroundColor Green
} else {
    # Si ya tiene .git, verificar que el remote apunte al correcto
    $currentRemote = git remote get-url origin 2>&1
    if ($currentRemote -ne $GITHUB) {
        git remote set-url origin $GITHUB
        Write-Host "        Remote actualizado a: $GITHUB" -ForegroundColor Green
    } else {
        Write-Host "        OK: ya vinculado a GitHub." -ForegroundColor Green
    }
}

# Traer el estado actual de GitHub sin sobreescribir archivos locales
git fetch origin
Write-Host "        Sincronizado con GitHub." -ForegroundColor Green

# =============================================================
# PASO 5 — Instalar Pillow
# =============================================================
Write-Host "[ 5/8 ] Instalando Pillow..." -ForegroundColor Cyan
pip install pillow --quiet
$pillowCheck = python -c "import PIL; print(PIL.__version__)" 2>&1
Write-Host "        OK: Pillow $pillowCheck" -ForegroundColor Green

# =============================================================
# PASO 6 — Instalar openpyxl (para generate-products.py)
# =============================================================
Write-Host "[ 6/8 ] Instalando openpyxl..." -ForegroundColor Cyan
pip install openpyxl --quiet
$xlCheck = python -c "import openpyxl; print(openpyxl.__version__)" 2>&1
Write-Host "        OK: openpyxl $xlCheck" -ForegroundColor Green

# =============================================================
# PASO 7 — Credenciales GitHub (token)
# =============================================================
Write-Host "[ 7/8 ] Configurando credenciales de GitHub..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Para que la app pueda publicar sin pedir contrasena cada vez," -ForegroundColor Yellow
Write-Host "  necesitas un token personal de GitHub." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Pasos:" -ForegroundColor White
Write-Host "  1. Abre este link en el navegador:"
Write-Host "     https://github.com/settings/tokens/new" -ForegroundColor Cyan
Write-Host "  2. Note (nombre): Docolco PC"
Write-Host "  3. Expiration: No expiration"
Write-Host "  4. Marca el permiso: [x] repo"
Write-Host "  5. Clic en 'Generate token'"
Write-Host "  6. Copia el token (empieza con ghp_...)"
Write-Host ""
$token = Read-Host "  Pega el token aqui y presiona Enter"

if ($token -ne "") {
    # Guardar en el credential store de Windows
    $credTarget = "git:https://github.com"
    $cred = New-Object System.Net.NetworkCredential("llcdocolco-lgtm", $token)
    
    # Usar git credential store
    git config --global credential.helper manager
    
    # Hacer un fetch autenticado para guardar las credenciales
    $env:GIT_ASKPASS = "echo"
    $env:GIT_USERNAME = "llcdocolco-lgtm"
    $env:GIT_PASSWORD = $token
    
    git -c "credential.helper=" -c "credential.username=llcdocolco-lgtm" fetch origin 2>&1 | Out-Null
    
    # Guardar permanentemente via cmdkey
    cmdkey /add:git:https://github.com /user:llcdocolco-lgtm /pass:$token | Out-Null
    
    Write-Host "        OK: credenciales guardadas." -ForegroundColor Green
} else {
    Write-Host "        OMITIDO. Podras configurarlo despues." -ForegroundColor Yellow
}

# =============================================================
# PASO 8 — Crear acceso directo en el Escritorio
# =============================================================
Write-Host "[ 8/8 ] Creando acceso directo en el Escritorio..." -ForegroundColor Cyan

$batPath = Join-Path $REPO "tools\Iniciar Image Manager.bat"
$shortcutPath = "$env:USERPROFILE\Desktop\Docolco Image Manager.lnk"

if (Test-Path $batPath) {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $batPath
    $Shortcut.WorkingDirectory = $REPO
    $Shortcut.Description = "Subir imagenes de productos Docolco"
    $Shortcut.IconLocation = "shell32.dll,21"
    $Shortcut.Save()
    Write-Host "        OK: acceso directo creado en el Escritorio." -ForegroundColor Green
} else {
    Write-Host "        AVISO: tools\Iniciar Image Manager.bat no existe aun." -ForegroundColor Yellow
    Write-Host "        Crealo primero con Claude Code, luego vuelve a correr este paso." -ForegroundColor Yellow
    
    # Crear la carpeta tools si no existe
    $toolsDir = Join-Path $REPO "tools"
    if (-not (Test-Path $toolsDir)) {
        New-Item -ItemType Directory -Path $toolsDir | Out-Null
        Write-Host "        Carpeta tools\ creada." -ForegroundColor Green
    }
}

# =============================================================
# RESUMEN FINAL
# =============================================================
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION FINAL" -ForegroundColor Cyan  
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$pyOK     = (python --version 2>&1) -match "Python 3"
$gitOK    = (git --version 2>&1) -match "git version"
$pillowOK = (python -c "import PIL" 2>&1) -eq ""
$xlOK     = (python -c "import openpyxl" 2>&1) -eq ""
$repoOK   = Test-Path "$REPO\.git"

Write-Host ("  Python     : " + $(if ($pyOK)     { "OK" } else { "FALTA" })) -ForegroundColor $(if ($pyOK)     { "Green" } else { "Red" })
Write-Host ("  Git        : " + $(if ($gitOK)    { "OK" } else { "FALTA" })) -ForegroundColor $(if ($gitOK)    { "Green" } else { "Red" })
Write-Host ("  Pillow     : " + $(if ($pillowOK) { "OK" } else { "FALTA" })) -ForegroundColor $(if ($pillowOK) { "Green" } else { "Red" })
Write-Host ("  openpyxl   : " + $(if ($xlOK)     { "OK" } else { "FALTA" })) -ForegroundColor $(if ($xlOK)     { "Green" } else { "Red" })
Write-Host ("  Repo local : " + $(if ($repoOK)   { "OK — $REPO" } else { "FALTA .git" })) -ForegroundColor $(if ($repoOK) { "Green" } else { "Red" })
Write-Host ""

if ($pyOK -and $gitOK -and $pillowOK -and $xlOK -and $repoOK) {
    Write-Host "  Todo listo." -ForegroundColor Green
    Write-Host "  El usuario puede abrir la app con doble clic en el Escritorio." -ForegroundColor Green
} else {
    Write-Host "  Algunos items fallaron. Revisa los errores arriba." -ForegroundColor Red
}

Write-Host ""
Write-Host "  Soporte: Samuel Rojas — +57 304 353 8450" -ForegroundColor Gray
Write-Host ""
Read-Host "  Presiona Enter para cerrar"
