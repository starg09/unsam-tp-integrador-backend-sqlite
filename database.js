var sqlite3 = require('sqlite3').verbose()
//var md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')

        var setupTabla = (create_query, insert_query, initial_data) => {
            db.run(create_query,
            (err) => {
                if (err) {
                    // Table already created
                }else{
                    // Table just created, creating some rows
                    var insert = insert_query
                    for(row of initial_data) {
                        db.run(insert, row)
                    }
                }
            })
        }


        setupTabla(
            `CREATE TABLE Contenido (
                id_contenido   INTEGER      PRIMARY KEY AUTOINCREMENT,
                titulo         VARCHAR (80),
                fecha_pub      DATE,
                extension      VARCHAR (15),
                tipo_contenido VARCHAR (3)  NOT NULL,
                CHECK (tipo_contenido IN ('Doc', 'Vid', 'Mus') )
            )`,
            'INSERT INTO Contenido (titulo, fecha_pub, extension, tipo_contenido) VALUES (?,?,?,?)',
            [
                ['Programación en Java', '2017-5-22', 'mp4', 'Vid'],
                ['Iceberg de los Mundiales', '2018-6-18', 'mp4', 'Vid'],
                ['Trucos del GTA SA', '2018-7-4', 'pdf', 'Doc'],
                ['Top Kids Edición N3', '2019-1-2', 'docx', 'Doc'],
                ['Trucos del Mortal Kombat', '2019-3-12', 'docx', 'Doc'],
                ['La Metamorfosis', '2020-3-2', 'docx', 'Doc'],
                ['Unboxing de Consolas de Videojuegos', '2020-7-21', '3gp', 'Vid'],
                ['Curso de React', '2020-8-10', '3gp', 'Vid'],
                ['Top canciones de los 90', '2020-9-7', 'mp4', 'Vid'],
                ['El Principito', '2020-9-10', 'pdf', 'Doc'],
                ['Overworld Theme SMB', '2020-12-9', 'mp3', 'Mus'],
                ['Cuentas del mes', '2021-1-22', 'xls', 'Doc'],
                ['Top Discos de Hard Rock', '2021-3-14', 'mp4', 'Vid'],
                ['Revista Magic (Retro)', '2021-5-5', 'pdf', 'Doc'],
                ['Cuentos de la Selva', '2021-5-13', 'pdf', 'Doc'],
                ['Pizzas hechas con sarten', '2021-6-14', 'avi', 'Vid'],
                ['Promedios del Futbol Argentino', '2021-8-3', 'xls', 'Doc'],
                ['Review de Celulares Retros', '2021-9-5', 'avi', 'Vid'],
                ['Back In Black', '2021-9-12', 'wav', 'Mus'],
                ['La Cocina de Doña Petrona', '2021-10-6', 'pdf', 'Doc'],
                ['Enjoy The Silence', '2021-10-7', 'mp3', 'Mus'],
                ['November Rain', '2021-10-11', 'm4a', 'Mus'],
                ['Top 20 caidas en pasarelas', '2021-10-30', 'rmvb', 'Vid'],
                ['In The End', '2021-11-3', 'flac', 'Mus'],
                ['Eyes of The Tiger', '2021-11-8', 'aac', 'Mus'],
                ['Hotel California', '2021-11-9', 'wav', 'Mus'],
                ['Argentina - Por Mil Noches (Emotivo)', '2021-11-10', 'aac', 'Mus'],
                ['We Are The Champions', '2021-11-10', 'flac', 'Mus'],
                ['Historias Innecesarias', '2021-11-10', 'mkv', 'Doc'],
                ['Cult Of Personality', '2021-11-11', 'mp3', 'Mus']
            ]
        )


        setupTabla(
            `CREATE TABLE Categoria (
                id_categoria INTEGER       PRIMARY KEY AUTOINCREMENT,
                descripcion  VARCHAR (100)
            )`,
            'INSERT INTO Categoria (descripcion) VALUES (?)',
            [
                ['Rock'],
                ['Metal'],
                ['Emotivo'],
                ['Analisis'],
                ['Ranking'],
                ['Deporte'],
                ['Gaming'],
                ['Pop'],
                ['Personal'],
                ['Cocina'],
                ['Tutorial']
            ]
        )


        setupTabla(
            `CREATE TABLE CategoriasContenido (
                id_contenido INTEGER REFERENCES Contenido (id_contenido),
                id_categoria INTEGER REFERENCES Categoria (id_categoria),
                PRIMARY KEY (
                    id_contenido,
                    id_categoria
                )
            )`,
            'INSERT INTO CategoriasContenido (id_contenido, id_categoria) VALUES (?,?)',
            [
                [27, 3],
                [27, 6],
                [20, 10],
                [20, 1],
                [20, 11],
                [7, 7],
                [12, 9]
            ]
        )


        setupTabla(
            `CREATE TABLE Comentario (
                id_comentario INTEGER       PRIMARY KEY AUTOINCREMENT,
                titulo        VARCHAR (50),
                descripcion   VARCHAR (200),
                apodo_autor   VARCHAR (20),
                id_contenido  INTEGER       REFERENCES Contenido (id_contenido)
                                            NOT NULL
            )`,
            'INSERT INTO Comentario (titulo, descripcion, apodo_autor, id_contenido) VALUES (?,?,?,?)',
            []
        )


        setupTabla(
            `CREATE TABLE Replica (
                id_replica          INTEGER       PRIMARY KEY AUTOINCREMENT,
                detalle             VARCHAR (200),
                apodo_autor         VARCHAR (20),
                id_comentario       INTEGER       REFERENCES Comentario (id_comentario)
                                                  NOT NULL,
                id_replica_original INTEGER       REFERENCES Replica (id_replica)
            )`,
            'INSERT INTO Replica (detalle, apodo_autor, id_comentario, id_replica_original) VALUES (?,?,?,?)',
            []
        )


        setupTabla(
            `CREATE TABLE Visualizacion (
                id_visualizacion INTEGER      PRIMARY KEY AUTOINCREMENT,
                id_video         INTEGER      REFERENCES Contenido (id_contenido)
                                              NOT NULL,
                fecha_inicio     DATE,
                hora_inicio      TIME,
                fecha_final      DATE,
                hora_final       TIME,
                os_utilizado     VARCHAR (30)
            )`,
            'INSERT INTO Visualizacion (id_video, fecha_inicio, hora_inicio, fecha_final, hora_final, os_utilizado) VALUES (?,?,?,?,?,?)',
            []
        )


        setupTabla(
            `CREATE TABLE Contenido_Descargable (
                id_descargable INTEGER PRIMARY KEY AUTOINCREMENT,
                id_contenido   INTEGER REFERENCES Contenido (id_contenido)
            )`,
            'INSERT INTO Contenido_Descargable (id_contenido) VALUES (?)',
            [
                [1],
                [2],
                [4],
                [20],
                [7],
                [9],
                [14],
                [13],
                [21],
                [20],
                [12],
                [27]
            ]
        )


        setupTabla(
            `CREATE TABLE Usuario (
                id_usuario INTEGER      PRIMARY KEY AUTOINCREMENT,
                apellido   VARCHAR (30),
                nombre     VARCHAR (30),
                fecha_nac  DATE,
                password   VARCHAR (15)
            )`,
            'INSERT INTO Usuario (apellido, nombre, fecha_nac, password) VALUES (?,?,?,?)',
            [
                ['Bianchi', 'Guillermo', '1995-12-10', 'hunter2'],
                ['Pavon', 'Rodrigo', '1997-11-04', '123457'],
                ['Albedo', 'Dario', '1996-02-07', 'abcd']
            ]
        )


        setupTabla(
            `CREATE TABLE Descarga (
                id_descarga        INTEGER PRIMARY KEY AUTOINCREMENT,
                id_descargable     INTEGER REFERENCES Contenido_Descargable (id_descargable),
                id_usuario         INTEGER REFERENCES Usuario (id_usuario),
                fecha_descarga     DATE,
                velocidad_descarga DOUBLE
            )`,
            'INSERT INTO Descarga (id_descargable, id_usuario, fecha_descarga, velocidad_descarga) VALUES (?,?,?,?)',
            [
                [12, 3, '2021-03-08', 56.6],
                [4, 3, '2021-04-08', 2048.0],
                [4, 2, '2021-04-12', 512.0],
                [5, 3, '2021-06-08', 200.0],
                [4, 1, '2021-11-07', 1000.0],
                [7, 3, '2021-08-22', 220.0],
                [11, 3, '2021-11-05', 440.0],
                [4, 3, '2021-11-07', 430.0],
                [4, 3, '2021-11-08', 420.0],
                [11, 3, '2021-09-15', 200.0]
            ]
        )


        setupTabla(
            `CREATE TABLE Encuesta_Descarga (
                id_encuesta                 INTEGER       PRIMARY KEY AUTOINCREMENT,
                id_descarga                 INTEGER       REFERENCES Descarga (id_descarga),
                puntaje_global_experiencia  INTEGER,
                resumen_positivo_plataforma VARCHAR (140),
                resumen_negativo_plataforma VARCHAR (140),
                resumen_positivo_descarga   VARCHAR (140),
                resumen_negativo_descarga   VARCHAR (140)
            )`,
            'INSERT INTO Encuesta_Descarga (id_descarga, puntaje_global_experiencia, resumen_positivo_plataforma, resumen_negativo_plataforma, resumen_positivo_descarga, resumen_negativo_descarga) VALUES (?,?,?,?,?,?)',
            [
                [7, 5, 'Boena Descarga', 'Descarga Malarda', 'Plataforma Copada', 'Estafa de crypto']
            ]
        )

    }
});


module.exports = db