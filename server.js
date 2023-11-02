const Koa = require("koa");
const Router = require("koa-router");
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const { PrismaClient } = require('@prisma/client');

let prisma = new PrismaClient();

const app = new Koa();
const router = new Router();
router.use(koaBody());

router.post("/db/runs/create", async (ctx) => {
  let data = ctx.request.body;

  let run = await prisma.runs.create({
    data: data
  }).catch((e) => {
    console.log(e);
  })

  ctx.body = run;
})

router.post("/db/runs/query", async (ctx) => {
  let query = ctx.request.body;
  let results = await prisma.runs.findMany(query).catch((e) => {
    console.log(e);
  });
  ctx.body = results;
})

router.post("/db/runs/aggregate", async (ctx) => {
  let query = ctx.request.body;
  let results = await prisma.runs.aggregate(query).catch((e) => {
    console.log(e);
  });
  ctx.body = results;
})

router.post("/db/runs/groupby", async (ctx) => {
  let query = ctx.request.body;
  let results = await prisma.runs.groupBy(query).catch((e) => {
    console.log(e);
  });
  ctx.body = results;
})

router.post("/db/runs/count", async (ctx) => {
  let query = ctx.request.body;
  let results = await prisma.runs.count(query).catch((e) => {
    console.log(e);
  });
  ctx.body = results;
})

app.use(cors());
app.use(router.routes()).use(router.allowedMethods())

let port = 5000;
app.listen(port, () => {
  console.log("Started backend server on port " + port + ".")
});