// test-api.js - Para probar que todo funciona
import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log("🔍 Probando API de Reportes...\n");

    // 1. Probar servidor
    try {
        const res = await fetch(`${BASE_URL}/`);
        const data = await res.json();
        console.log("✅ Servidor funcionando:", data.mensaje);
    } catch (error) {
        console.log("❌ Servidor no responde:", error.message);
        return;
    }

    // 2. Probar registro
    console.log("\n📝 Probando registro...");
    const registerRes = await fetch(`${BASE_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usuario: "testuser",
            password: "123456"
        })
    });
    const registerData = await registerRes.json();
    console.log("Registro:", registerData.mensaje);

    // 3. Probar login
    console.log("\n🔐 Probando login...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usuario: "testuser",
            password: "123456"
        })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginData.mensaje, loginData.success ? "✅" : "❌");

    // 4. Ver estado
    console.log("\n💓 Verificando estado...");
    const statusRes = await fetch(`${BASE_URL}/status`);
    const statusData = await statusRes.json();
    console.log("Estado:", statusData);
}

testAPI();