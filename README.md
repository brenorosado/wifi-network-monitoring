# CSN GEO WIFI

## COMO RODAR O DOCKER CONTENDO FRONT, API, BANCO E GEOSERVER

- Instale o docker e docker compose. [Documentação aqui](https://docs.docker.com/compose/install/);
- Clique [aqui](https://drive.google.com/file/d/1n77TidZlFQvViA5-zXF7DgKl2npX_5Og/view?usp=sharing) para baixar a imagem georeferenciada.
- Insira a imagem baixada na pasta raiz do projeto com o nome `CONGONHAS_2018_2019.tif`.
- Gere a versão comprimida (282 MB no lugar de 2.1 GB) rodando uma vez:
  ```bash
  gdal_translate -b 1 -b 2 -b 3 -of COG -co COMPRESS=JPEG -co QUALITY=75 CONGONHAS_2018_2019.tif CONGONHAS_2018_2019_optimized.tif
  ```
  Instale o GDAL se necessário: `brew install gdal` (Mac) ou `apt install gdal-bin` (Linux).
- O arquivo `CONGONHAS_2018_2019_optimized.tif` gerado é o que será usado pelo Docker.
- No terminal, navegue até este diretório e execute `docker compose up --build` ou `docker-compose up --build` para versões antigas;

- Instâncias:
  - FRONT: http://localhost:3000/
  - API: http://localhost:4011/
  - GEOSERVER: http://localhost:8080/geoserver

## POPULAR O BANCO COM DADOS DE TESTE

O serviço `seed` é incluído no docker-compose e roda automaticamente após as migrations. Ele insere **500 medidas aleatórias** na tabela `peer` com coordenadas dentro dos limites de Congonhas, valores de `cost` (0–200) e `rssi` (-110–0) e timestamps entre 2019 e 2023.

Para re-popular o banco manualmente (apaga os dados existentes e insere novos):

```bash
docker-compose run --rm seed
```

Ou, se preferir rodar fora do Docker (dentro da pasta `api/`):

```bash
npm run seed
```
