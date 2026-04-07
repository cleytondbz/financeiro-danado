# Guia de Deploy no Railway

## O que é Railway?
Railway é uma plataforma de deploy gratuita que hospeda aplicações web com banco de dados incluído. Perfeita para seu caso de uso com múltiplos dispositivos.

## Pré-requisitos
1. Conta GitHub (para conectar seu repositório)
2. Conta Railway (gratuita em railway.app)

## Passo 1: Preparar o Repositório GitHub

### 1.1 Criar repositório no GitHub
```bash
# Se ainda não tem repositório
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/financeiro-danado.git
git push -u origin main
```

### 1.2 Adicionar arquivo railway.json
Crie um arquivo `railway.json` na raiz do projeto:

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 5
  }
}
```

## Passo 2: Deploy no Railway

### 2.1 Acessar Railway
1. Vá para https://railway.app
2. Clique em "Login with GitHub"
3. Autorize a conexão

### 2.2 Criar novo projeto
1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Conecte seu repositório `financeiro-danado`
4. Selecione a branch `main`

### 2.3 Configurar variáveis de ambiente
No painel do Railway, vá para "Variables" e adicione:

```
NODE_ENV=production
VITE_APP_TITLE=Financeiro DANADO
```

### 2.4 Iniciar deploy
Railway fará o deploy automaticamente. Você verá um link público como:
```
https://seu-app.railway.app
```

## Passo 3: Usar em Múltiplos Dispositivos

Agora que está hospedado no Railway:

✅ **Acesse de qualquer dispositivo:** Abra o link público em celular, tablet, computador
✅ **Dados sincronizados:** Todos os dados são salvos no localStorage do navegador
✅ **Sem perder dados:** Os dados persistem entre sessões no mesmo dispositivo

**Nota:** Atualmente, cada dispositivo ainda tem seus próprios dados isolados (localStorage local). Para sincronizar dados entre dispositivos, precisamos implementar um banco de dados MySQL.

## Passo 4: Próxima Etapa - Sincronização com Banco de Dados (Opcional)

Se quiser que 5 pessoas compartilhem os mesmos dados:

1. Railway oferece MySQL gratuito por 90 dias
2. Podemos migrar os dados para o banco de dados
3. Todos verão as mesmas informações em tempo real

**Deseja fazer essa migração?** Avise e faremos juntos!

## Troubleshooting

### Deploy falhou?
- Verifique se todos os arquivos foram commitados
- Veja os logs no painel do Railway
- Certifique-se que o `package.json` tem o script `start`

### Aplicação não carrega?
- Verifique se as variáveis de ambiente estão corretas
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Tente em uma aba anônima

### Precisa de ajuda?
Contate o suporte do Railway em https://railway.app/support

---

**Seu link público será:** `https://seu-app.railway.app`

Compartilhe esse link com as 5 pessoas que precisam acessar!
