# CSN GEO WIFI

## COMO RODAR O DOCKER CONTENDO FRONT, API, BANCO E GEOSERVER

- Instale o docker e docker compose. [Documentação aqui](https://docs.docker.com/compose/install/);
- Clique [aqui](https://drive.google.com/file/d/1n77TidZlFQvViA5-zXF7DgKl2npX_5Og/view?usp=sharing) para baixar a imagem georeferenciada já otimizada (`CONGONHAS_2018_2019_optimized.tif`, ~196 MB).
- Insira o arquivo baixado na pasta raiz do projeto mantendo o nome `CONGONHAS_2018_2019_optimized.tif`.
- No terminal, navegue até este diretório e execute `docker compose up --build` ou `docker-compose up --build` para versões antigas;

- Instâncias:
  - FRONT: http://localhost:3000/
  - API: http://localhost:4011/
  - GEOSERVER: http://localhost:8080/geoserver

## POPULAR O BANCO COM DADOS DE TESTE

O seed insere medidas de teste próximas a 56 pontos reais na região de Congonhas (9 medidas por ponto), com valores aleatórios de `cost` (0–200) e `rssi` (-110–0) e timestamps entre 2019 e 2023.

Para popular o banco (apaga os dados existentes e insere novos):

```bash
docker-compose run --rm seed
```

Ou, se preferir rodar fora do Docker (dentro da pasta `api/`):

```bash
npm run seed
```
