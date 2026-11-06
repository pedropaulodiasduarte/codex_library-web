# ETAPA 1: Construção do Frontend (Angular)

FROM node:20-alpine AS frontend-builder
WORKDIR /app-frontend

# Copia os arquivos de dependência do Angular
#frontend/package*.json: A origem dos arquivos. Procura dentro da pasta frontend do projeto local todos os arquivos que comecem com package e terminem com .json (o que pega tanto o package.json quanto o package-lock.json).
#./: O destino. Copia esses arquivos para a pasta de trabalho atual (WORKDIR) definida no container (que é /app-frontend).
COPY frontend/package*.json ./
RUN npm install

# Copia o restante do código do Angular e faz o build de produção
COPY frontend/ ./
RUN npm run build -- --configuration production

# ETAPA 2: Construção do Backend (Spring Boot + Java 21)
FROM eclipse-temurin:21-jdk-alpine AS backend-builder
WORKDIR /app-backend

# Copia os arquivos de configuração do Maven/Gradle do Spring Boot
COPY backend/.mvn/ .mvn
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copia o código fonte do Java
COPY backend/src/ ./src

# COPIA OS ARQUIVOS ESTÁTICOS DO ANGULAR DA ETAPA 1
# --from=frontend-builder: pega o arquivo dentro da etapa anterior chamada frontend-builder.
# /app-frontend/: É a pasta de trabalho onde o Angular foi compilado na etapa 1.
# /dist/: É a pasta padrão onde o Angular (ng build) guarda o resultado final de produção.
# /*/: O asterisco (*) serve como um curinga (wildcard). O Angular costuma criar uma subpasta com o nome do projeto dentro de dist/ (por exemplo, dist/codex-frontend/). O asterisco garante que o Docker vai achar essa pasta independentemente do nome exato que o Angular der a ela.
# Resumo: O comando pega os arquivos finais do site Angular que foram gerados na etapa do Node.js (/app-frontend/dist/.../browser) e os joga para dentro da pasta do Spring Boot (./src/main/resources/static) para que, quando o Java for empacotado, o site vá junto dentro do .jar.
COPY --from=frontend-builder /app-frontend/dist/*/browser ./src/main/resources/static

# Compila o projeto Spring Boot gerando o .jar final
RUN ./mvnw clean package -DskipTests

# ETAPA 3: Imagem Final de Execução (Leve)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia apenas o arquivo .jar gerado na etapa anterior
COPY --from=backend-builder /app-backend/target/*.jar app.jar

# Expõe a porta que o Spring Boot roda (ex: 8080)
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]