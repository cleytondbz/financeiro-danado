# Financeiro DANADO - TODO

## Dashboard
- [x] Comparação de mês anterior em porcentagem
- [x] Gráfico de comparação de dias com seleção personalizável

## Lançamentos
- [x] Opção de "+ Lançar" contínuo (não fechar aba ao salvar)
- [x] Opção de ativar/desativar fechamento automático
- [x] Categorias com opção "nulo" (não soma nem subtrai)
- [x] Opção para reordenar/mudar ordem das categorias (drag & drop)

## Dívidas
- [x] Opção de editar dívida

## Totais
- [x] Gráfico comparativo diário das duas lojas

## Melhorias Solicitadas
- [x] Corrigir categoria "nulo" para não somar/subtrair
- [x] Melhorar responsividade mobile da tabela de lançamentos
- [x] Adicionar filtro por período (múltiplos meses)
- [x] Melhorar visibilidade da tabela horizontal no mobile (Opção C)

## Concluído
- [x] Upgrade para web-db-user com banco de dados
- [x] API tRPC para sincronização
- [x] Autenticação integrada
- [x] Estrutura básica das telas

## Persistência no Banco de Dados
- [ ] Criar procedures tRPC para CRUD de dados
- [ ] Atualizar AppContext para sincronizar com tRPC
- [ ] Implementar sincronização bidirecional
- [ ] Testar persistência e sincronização


## Novas Funcionalidades Solicitadas
- [x] Seletor de loja na parte superior do header
- [x] Reordenação de categorias com drag & drop na aba de Lançamentos
- [x] Opções de tipos de gráficos (barras, linhas, pizza, área) em todas as abas

## Ajustes Solicitados
- [x] Mover reordenação de categorias para a aba de Lançamentos (na seção de Categorias)00e7\u00e3o de Categorias)


## Bugs Reportados
- [x] Corrigir erro "An unexpected error occurred" ao trocar de abas
- [x] Remover mensagem "Reordenação de categorias em desenvolvimento" e habilitar drag & drop
- [x] Corrigir categoria "Nulo" aparecendo como "Subtrai" no Dashboard


## Novos Ajustes Solicitados
- [x] Corrigir função de reordenação de categorias (setas não estão movendo)
- [x] Corrigir exibição visual de "Nulo" no Dashboard (remover "- Subtrai")
- [x] Aumentar seletor de loja e mover para lado esquerdo
- [x] Remover tela de senha

## Bugs Críticos a Corrigir
- [x] Troca de loja não funciona - clique em Loja 2 não muda a loja
- [x] Mover categoria com setas não funciona - reordenação não está sendo aplicada
- [x] Remover modo escuro - deixar apenas modo claro

- [x] Corrigir aba Totais - categoria "sangria" (nulo) está subtraindo do total

- [x] Remover seção "Visualizar" (Mês, 3M, 6M, 12M) de todas as abas
- [x] Adicionar comparação em porcentagem com mês anterior no Dashboard

- [x] Criar funcionalidade de exportação de relatório em PDF

- [x] Corrigir download do PDF - botão não está baixando o arquivo


## Implementação de Backend com Sincronização
- [x] Criar schema do banco de dados (stores, categories, entries, debts)
- [x] Criar APIs tRPC para CRUD de dados
- [x] Criar instruções de deploy no Railway
- [ ] Atualizar frontend para usar APIs (próximo passo)
- [ ] Testar sincronização entre múltiplos dispositivos (após deploy)


## Documentação Criada
- [x] Guia completo do zero (GUIA_COMPLETO_RAILWAY.md)
- [x] Guia de atualização contínua (GUIA_ATUALIZACOES.md)
- [x] Guia de deploy passo a passo (DEPLOY_PASSO_A_PASSO.md)
