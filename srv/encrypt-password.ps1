# Password Encryption Utility
# Encrypts password for use in .env file with SECRET_CODE

param(
    [string]$Password,
    [string]$SecretCode
)

function Encrypt-Password {
    param(
        [string]$PlaintextPassword,
        [string]$SecretCode
    )
    
    if ([string]::IsNullOrEmpty($PlaintextPassword) -or [string]::IsNullOrEmpty($SecretCode)) {
        throw "Both password and secret code are required"
    }
    
    try {
        # Simple XOR encryption
        $passwordBytes = [System.Text.Encoding]::UTF8.GetBytes($PlaintextPassword)
        $secretBytes = [System.Text.Encoding]::UTF8.GetBytes($SecretCode)
        $encryptedBytes = New-Object byte[] $passwordBytes.Length
        
        for ($i = 0; $i -lt $passwordBytes.Length; $i++) {
            $encryptedBytes[$i] = $passwordBytes[$i] -bxor $secretBytes[$i % $secretBytes.Length]
        }
        
        return [System.Convert]::ToBase64String($encryptedBytes)
    } catch {
        throw "Error encrypting password: $_"
    }
}

# Main execution
if ([string]::IsNullOrEmpty($Password)) {
    $Password = Read-Host "Enter password to encrypt" -AsSecureString
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))
}

if ([string]::IsNullOrEmpty($SecretCode)) {
    $SecretCode = Read-Host "Enter secret code for encryption"
}

try {
    $encryptedPassword = Encrypt-Password -PlaintextPassword $Password -SecretCode $SecretCode
    
    Write-Host ""
    Write-Host "ENCRYPTED PASSWORD RESULT:" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Add these lines to your .env file:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SECRET_CODE=$SecretCode" -ForegroundColor Cyan
    Write-Host "SSH_PASS_SEC=$encryptedPassword" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Remove or comment out the old SSH_PASS line:" -ForegroundColor Yellow
    Write-Host "# SSH_PASS=your_old_plaintext_password" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}