$REPO = "C:\Users\Plasfilm\Downloads\edicion docolco website"
$GITHUB = "https://github.com/llcdocolco-lgtm/Website"

Write-Host "[ 1/7 ] Verificando Python..." -ForegroundColor Cyan
$pyOK = $false
try { $v = python --version 2>&1; Write-Host "        OK: $v" -ForegroundColor Green; $pyOK = $true }
catch { Write-Host "        FALTA - Instalar desde python.org (marcar Add to PATH)" -ForegroundColor Red }

Write-Host "[ 2/7 ] Verificando Git..." -ForegroundColor Cyan
$gitOK = $false
try { $v = git --version 2>&1; Write-Host "        OK: $v" -ForegroundColor Green; $gitOK = $true }
catch { Write-Host "        FALTA - Instalar desde git-scm.com/download/win" -ForegroundColor Red }

if ($gitOK) {
    Write-Host "[ 3/7 ] Configurando Git..." -ForegroundColor Cyan
    git config --global user.name "Docolco"
    git config --global user.email "info@docolco.com"
    git config --global core.autocrlf true
    git config --global credential.helper manager
    Write-Host "        OK" -ForegroundColor Green

    Write-Host "[ 4/7 ] Vinculando repo local con GitHub..." -ForegroundColor Cyan
    Set-Location $REPO
    if (-not (Test-Path "$REPO\.git")) {
        git init
        git remote add origin $GITHUB
    } else {
        git remote set-url origin $GITHUB
    }
    git fetch origin 2>&1 | Out-Null
    Write-Host "        OK" -ForegroundColor Green
}

if ($pyOK) {
    Write-Host "[ 5/7 ] Instalando Pillow..." -ForegroundColor Cyan
    pip install pillow --quiet
    Write-Host "        OK" -ForegroundColor Green

    Write-Host "[ 6/7 ] Instalando openpyxl..." -ForegroundColor Cyan
    pip install openpyxl --quiet
    Write-Host "        OK" -ForegroundColor Green
}

Write-Host "[ 7/7 ] Creando acceso directo en el Escritorio..." -ForegroundColor Cyan
$batPath = Join-Path $REPO "tools\Iniciar Image Manager.bat"
$desktop = [Environment]::GetFolderPath("Desktop")
$toolsDir = Join-Path $REPO "tools"
if (-not (Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir | Out-Null }
if (Test-Path $batPath) {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$desktop\Docolco Image Manager.lnk")
    $Shortcut.TargetPath = $batPath
    $Shortcut.WorkingDirectory = $REPO
    $Shortcut.Description = "Subir imagenes de productos Docolco"
    $Shortcut.IconLocation = "shell32.dll,21"
    $Shortcut.Save()
    Write-Host "        OK: acceso directo creado." -ForegroundColor Green
} else {
    Write-Host "        AVISO: tools\Iniciar Image Manager.bat no existe aun." -ForegroundColor Yellow
    Write-Host "        Crealo con Claude Code primero, luego vuelve a este paso." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
$pyOK2     = (python --version 2>&1) -match "Python 3"
$gitOK2    = (git --version 2>&1) -match "git version"
$pillowOK  = (python -c "import PIL" 2>&1) -eq ""
$xlOK      = (python -c "import openpyxl" 2>&1) -eq ""
$repoOK    = Test-Path "$REPO\.git"
Write-Host ("  Python   : " + $(if ($pyOK2)    {"OK"} else {"FALTA"})) -ForegroundColor $(if ($pyOK2)    {"Green"} else {"Red"})
Write-Host ("  Git      : " + $(if ($gitOK2)   {"OK"} else {"FALTA"})) -ForegroundColor $(if ($gitOK2)   {"Green"} else {"Red"})
Write-Host ("  Pillow   : " + $(if ($pillowOK) {"OK"} else {"FALTA"})) -ForegroundColor $(if ($pillowOK) {"Green"} else {"Red"})
Write-Host ("  openpyxl : " + $(if ($xlOK)     {"OK"} else {"FALTA"})) -ForegroundColor $(if ($xlOK)     {"Green"} else {"Red"})
Write-Host ("  Repo git : " + $(if ($repoOK)   {"OK"} else {"FALTA"})) -ForegroundColor $(if ($repoOK)   {"Green"} else {"Red"})
Write-Host ""
Write-Host "  Soporte: Samuel Rojas - +57 304 353 8450" -ForegroundColor Gray
Read-Host "  Presiona Enter para cerrar"
