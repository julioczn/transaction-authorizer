# Transaction Authorizer Service

## Descrição

Um serviço simples de autorização de transações.

## Pré-requisitos

- Node.js v22.14.0
- Yarn
- Docker
- Docker Compose

## Configuração do Projeto

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DO_REPOSITORIO>
   ```

2. Instale as dependências:
   ```bash
   yarn install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo .env.example para .env:
     ```bash
     cp .env.example .env
     ```

## Subir o Banco de Dados com Docker

1. Inicie o banco de dados PostgreSQL usando Docker Compose:
   ```bash
   yarn docker:up
   yarn prisma:migrate
   ```

## Compilar e Executar o Projeto

1. Para desenvolvimento:
   ```bash
   yarn run start
   ```

2. Modo watch:
   ```bash
   yarn run start:dev
   ```

3. Modo produção:
   ```bash
   yarn run start:prod
   ```

## Documentação da API

A documentação da API pode ser acessada via Swagger. Após iniciar o projeto, acesse:
```
http://localhost:3000/docs
```

## Endpoints

### Criar Conta

- **URL:** `/accounts`
- **Método:** `POST`
- **Header**: `api_key`
- **Payload:**
  ```json
  {
    "balanceFood": 100.0,
    "balanceMeal": 100.0,
    "balanceCash": 100.0
  }
  ```
- **Resposta:**
  ```json
  {
    "accountId": "string"
  }
  ```

### Criar Transação

- **URL:** `/transactions`
- **Método:** `POST`
- **Payload:**
  ```json
  {
    "account": "string",
    "amount": 100,
    "mcc": "5811",
    "merchant": "Restaurant"
  }
  ```
- **Resposta:**
  ```json
  {
    "code": "00"
  }
  ```

## Testes

1. Para rodar os testes unitários:
   ```bash
   yarn run test
   ```

2. Para rodar os testes e2e:
   ```bash
   yarn run test:e2e
   ```

3. Para verificar a cobertura dos testes:
   ```bash
   yarn run test:cov
   ```

## Estrutura do Projeto

- `src`: Código fonte do projeto
- `test`: Testes do projeto
- `docker-compose.yml`: Configuração do Docker Compose
- `.env`: Arquivo de variáveis de ambiente

## Licença

Este projeto está licenciado sob a licença MIT.
