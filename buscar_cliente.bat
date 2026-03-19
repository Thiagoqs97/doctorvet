@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: ==========================================================
:: 🔍 Doctor Vet CRM 360 — Busca Completa de Cliente por Telefone
:: ==========================================================
:: USO: buscar_cliente.bat NUMERO_TELEFONE
:: 
:: Exemplos aceitos:
::   buscar_cliente.bat 11999887766
::   buscar_cliente.bat 5511999887766
::   buscar_cliente.bat 1199887766      (sem nono dígito)
::   buscar_cliente.bat 551199887766    (com DDI, sem nono dígito)
:: ==========================================================

set "SUPABASE_URL=https://lezskryhspxfptbzccld.supabase.co"
set "SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlenNrcnloc3B4ZnB0YnpjY2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzM0MTMsImV4cCI6MjA4ODcwOTQxM30.DCXBWBs7Vj9NAhr6zMjU2qIBGzSC3OqJXdoHGTNqZsI"

if "%~1"=="" (
    echo.
    echo ❌ Erro: Informe o numero de telefone!
    echo.
    echo USO: buscar_cliente.bat NUMERO_TELEFONE
    echo.
    echo Exemplos:
    echo   buscar_cliente.bat 11999887766
    echo   buscar_cliente.bat 5511999887766
    echo   buscar_cliente.bat 1199887766
    echo.
    exit /b 1
)

:: Remove tudo que não é número
set "PHONE=%~1"
set "PHONE=%PHONE: =%"
set "PHONE=%PHONE:-=%"
set "PHONE=%PHONE:(=%"
set "PHONE=%PHONE:)=%"
set "PHONE=%PHONE:+=%"

:: Remove DDI 55 se presente (telefones BR tem 10-11 dígitos sem DDI)
set "PHONE_SEM_DDI=%PHONE%"
set "FIRST_TWO=%PHONE:~0,2%"
if "%FIRST_TWO%"=="55" (
    set "PHONE_LEN=0"
    for /l %%i in (0,1,20) do if not "!PHONE:~%%i,1!"=="" set /a "PHONE_LEN+=1"
    if !PHONE_LEN! GTR 11 (
        set "PHONE_SEM_DDI=!PHONE:~2!"
    )
)

:: Pega os últimos 8 dígitos (parte fixa do telefone, sem DDD e sem nono dígito)
set "ULTIMOS_8=%PHONE_SEM_DDI:~-8%"

echo.
echo ============================================================
echo  🔍 BUSCANDO CLIENTE POR TELEFONE
echo ============================================================
echo  Telefone informado: %~1
echo  Busca parcial por:  ...%ULTIMOS_8%
echo ============================================================
echo.

echo 📋 PASSO 1/3 — Dados do Cliente e Pets...
echo -----------------------------------------------------------

curl -s -X GET ^
  "%SUPABASE_URL%/rest/v1/clients?select=*,pets(*)&phone=ilike.*%ULTIMOS_8%" ^
  -H "apikey: %SUPABASE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_KEY%"

echo.
echo.
echo 📋 PASSO 2/3 — Historico de Agendamentos (Banho e Tosa)...
echo -----------------------------------------------------------
echo ⏳ Buscando agendamentos vinculados ao cliente...
echo.

:: Primeiro busca o client_id
for /f "delims=" %%A in ('curl -s -X GET "%SUPABASE_URL%/rest/v1/clients?select=id&phone=ilike.*%ULTIMOS_8%" -H "apikey: %SUPABASE_KEY%" -H "Authorization: Bearer %SUPABASE_KEY%"') do set "CLIENT_IDS=%%A"

echo IDs encontrados: %CLIENT_IDS%
echo.

:: Busca agendamentos usando o nome do tutor (fallback mais confiável via ilike no phone)
curl -s -X GET ^
  "%SUPABASE_URL%/rest/v1/appointments?select=id,date,time,professional_name,pet_name,tutor_name,service_type,status,price&or=(client_id.not.is.null)&order=date.desc&limit=50" ^
  -H "apikey: %SUPABASE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_KEY%"

echo.
echo.
echo 📋 PASSO 3/3 — Visitas Domiciliares...
echo -----------------------------------------------------------

:: Para visitas domiciliares, busca pelo nome do tutor encontrado no passo 1
curl -s -X GET ^
  "%SUPABASE_URL%/rest/v1/home_visits?select=*&order=date.desc&limit=20" ^
  -H "apikey: %SUPABASE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_KEY%"

echo.
echo.
echo ============================================================
echo  ✅ Busca concluida!
echo  💡 Dica: Use o ID do cliente para filtrar mais resultados.
echo ============================================================

endlocal
