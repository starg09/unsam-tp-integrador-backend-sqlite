// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")


// parse application/json
app.use(express.json())
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Server port
var HTTP_PORT = 4040
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

const dbAll = (sql, params, res) => {
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message})
          return
        }
        res.json({
            "message":"success",
            "data":rows
        })
      })
}

const dbRun = function (sql, params, res) {
    db.run(sql, params, function (err){
        if (err) {
            res.status(400).json({"error":err.message})
            return
        }
        console.log(this)
        res.json({
            "message":"success",
            "changes":this.changes
        })
    })
}

// Insert here other API endpoints
app.get("/api/contenidos", (req, res, next) => {
    var sql = "select * from Contenido"
    var params = []
    dbAll(sql, params, res)
})


// app.get("/api/categoriascontenidos", (req, res, next) => {
//     var sql = `SELECT
//         Contenido.id_contenido AS 'ID Contenido',
//         (
//             SELECT
//                 group_concat(Categoria.descripcion, ', ')
//             FROM Categoria
//             INNER JOIN CategoriasContenido
//             ON Categoria.id_categoria = CategoriasContenido.id_categoria
//             WHERE CategoriasContenido.id_contenido = Contenido.id_contenido
//         ) AS 'Categorias'
//     FROM Contenido`
//     var params = []
//     dbAll(sql, params, res)
// })

app.get("/api/descargas/byUsuario/:userId", (req, res, next) => {
    var sql = `SELECT
        Descarga.id_descarga AS 'ID Descarga',
        Contenido.tipo_contenido AS 'Tipo Contenido',
        Contenido.titulo AS 'Titulo',
        ifnull(Encuesta_Descarga.puntaje_global_experiencia, 0) AS 'Puntaje Actual Encuesta',
        Descarga.fecha_descarga AS 'Fecha Descarga'
    FROM Descarga
    INNER JOIN Contenido_Descargable
    ON Descarga.id_descargable = Contenido_Descargable.id_descargable
    INNER JOIN Contenido
    ON Contenido_Descargable.id_contenido = Contenido.id_contenido
    LEFT OUTER JOIN Encuesta_Descarga
    ON Encuesta_Descarga.id_descarga = Descarga.id_descarga
    WHERE Descarga.id_usuario = ${req.params.userId}
    ORDER BY Descarga.fecha_descarga DESC`
    var params = []
    dbAll(sql, params, res)
})

app.delete("/api/descargas/:descargaId/eliminarEncuesta", (req, res, next) => {
    var sql = `DELETE FROM Encuesta_Descarga
    WHERE Encuesta_Descarga.id_descarga = ${req.params.descargaId}`
    var params = []
    dbRun(sql, params, res)
})

app.get("/api/descargas/:descargaId/getEncuesta", (req, res, next) => {
    var sql = `SELECT
        Encuesta_Descarga.id_encuesta as 'ID Encuesta',
        ifnull(Encuesta_Descarga.puntaje_global_experiencia, 0) AS 'Puntaje Actual Encuesta',
        ifnull(Encuesta_Descarga.resumen_positivo_descarga, '') AS 'Positivo Descarga',
        ifnull(Encuesta_Descarga.resumen_negativo_descarga, '') AS 'Negativo Descarga',
        ifnull(Encuesta_Descarga.resumen_positivo_plataforma, '') AS 'Positivo Plataforma',
        ifnull(Encuesta_Descarga.resumen_negativo_plataforma, '') AS 'Negativo Plataforma'
    FROM Descarga
    INNER JOIN Encuesta_Descarga
    ON Encuesta_Descarga.id_descarga = Descarga.id_descarga
    WHERE Descarga.id_descarga = ${req.params.descargaId}`
    var params = []
    dbAll(sql, params, res)
})

app.post("/api/descargas/:descargaId/setEncuesta", (req, res, next) => {
    const retornarError = (msg) => {
        res.status(400).json({"error":msg})
    }
    if (req.body == {}) { retornarError("No se entrego valores a actualizar"); return }

    const inRange = (x, min, max) => { return ( (x-min)*(x-max) <= 0 ) }

    const puntajeGlobal= req.body.puntajeGlobalExperiencia
    if (puntajeGlobal === null || !inRange(puntajeGlobal, 0, 5)) { retornarError("No se entregó un puntaje válido"); return }

    const resPositivoDescarga = req.body.resPositivoDescarga
    const resNegativoDescarga = req.body.resNegativoDescarga
    const resPositivoPlataforma = req.body.resPositivoPlataforma
    const resNegativoPlataforma = req.body.resNegativoPlataforma
    //TODO: Muchas validaciones a las constantes anteriores, evitar problemas de escapado, largo, etc. (para este TP solo lo controla react)

    var sql = `INSERT INTO Encuesta_Descarga (
        id_descarga,
        puntaje_global_experiencia,
        resumen_positivo_plataforma,
        resumen_negativo_plataforma,
        resumen_positivo_descarga,
        resumen_negativo_descarga
    )
    VALUES (
        ${req.params.descargaId},
        ${puntajeGlobal},
        "${resPositivoDescarga}",
        "${resNegativoDescarga}",
        "${resPositivoPlataforma}",
        "${resNegativoPlataforma}"
    ) ON CONFLICT(id_descarga) DO UPDATE SET
        puntaje_global_experiencia = excluded.puntaje_global_experiencia,
        resumen_positivo_plataforma = excluded.resumen_positivo_plataforma,
        resumen_negativo_plataforma = excluded.resumen_negativo_plataforma,
        resumen_positivo_descarga = excluded.resumen_positivo_descarga,
        resumen_negativo_descarga = excluded.resumen_negativo_descarga`
    var params = []
    dbRun(sql, params, res)
})


app.get("/api/descargas/reporte/byUsuario/:userId", (req, res, next) => {

    const filtros = [
        {
            value: req.query.fechaDescargaDesde,
            query: `Descarga.fecha_descarga >=`
        },
        {
            value: req.query.fechaDescargaHasta,
            query: `Descarga.fecha_descarga <=`
        },
        {
            value: req.query.fechaPubliDesde,
            query: `Contenido.fecha_pub >=`
        },
        {
            value: req.query.fechaPubliDesde,
            query: `Contenido.fecha_pub >=`
        },
        {
            value: req.query.tipoContenido,
            query: `Contenido.tipo_contenido =`
        }
    ].filter( (elem) => elem.value != null )

    console.log(req.query)


    //Necesita ser su propia lista, al ser un HAVING y no un WHERE
    const filtrosCalculados = [
        {
            value: req.query.minDescargas,
            query: `cant_descargas_por_usuario >=`
        },
        {
            value: req.query.maxDescargas,
            query: `cant_descargas_por_usuario <=`
        }
    ].filter( (elem) => elem.value != null )

    const sortVal = (req.query.sortBy != null) ? req.query.sortBy : ""
    const sortAsc = (req.query.sortAsc != null) ? req.query.sortBy : false
    var sortQuery = "ORDER BY "
    var sortAlt = ", cant_descargas_por_usuario DESC"
    switch (sortVal) {
        case 'fechaDescarga':
            sortQuery += `Descarga.fecha_descarga`
            break
        case 'fechaPub':
            sortQuery += `Contenido.fecha_pub`
            break
        case 'tipoContenido':
            sortQuery += `Contenido.fecha_pub`
            break
        case 'cantDescargas':
        default:
            sortQuery += `cant_descargas_por_usuario`
            sortAlt = ""
            break
    }
    sortQuery += ` ${sortAsc ? 'ASC' : 'DESC'}${sortAlt}`





    var sql = `SELECT
        Contenido.id_contenido AS 'ID Contenido',
        Contenido.tipo_contenido AS 'Tipo Contenido',
        Contenido.titulo AS 'Titulo',
        Contenido.fecha_pub AS 'Fecha Publicacion',
        (
            SELECT
                group_concat(Categoria.descripcion, ', ')
            FROM Categoria
            INNER JOIN CategoriasContenido
            ON Categoria.id_categoria = CategoriasContenido.id_categoria
            WHERE CategoriasContenido.id_contenido = Contenido.id_contenido
        ) AS 'Categorias',
        count(Descarga.id_descargable) AS cant_descargas_por_usuario,
        avg(Descarga.velocidad_descarga) AS 'Promedio Velocidad Descarga Usuario'
    FROM Descarga
    INNER JOIN Contenido_Descargable
    ON Descarga.id_descargable = Contenido_Descargable.id_descargable
    INNER JOIN Contenido
    ON Contenido_Descargable.id_contenido = Contenido.id_contenido
    WHERE Descarga.id_usuario = ${req.params.userId}
    ${filtros.map((elem) =>
        `AND ${elem.query} '${elem.value}'\n`).join()
    }
    GROUP BY Descarga.id_descargable
    -- Un filtro más, tiene que ir despues del GROUP BY ⬇
    ${
        (filtrosCalculados.length > 0) ? "HAVING " + filtrosCalculados.map((elem) => `${elem.query} ${elem.value}\n`).join(' AND ') :
        ""
    }
    -- Fin de un filtro más
    ${sortQuery}`
    var params = []
    console.log(sql)
    dbAll(sql, params, res)
})


// Default response for any other request
app.use(function(req, res){
    res.status(404)
    res.set("Connection", "close")
    res.json({error:true, error_message : "<some - error message>"})
})