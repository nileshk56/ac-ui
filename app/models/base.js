class Base {
    fetch(table, columns = "*", where, sort, limit, offset, cb) {
        var qr = `SELECT ${columns} FROM ${table}` ;
        console.log("asdf",where)
        if(!app.lib._.isEmpty(where)) {
            qr += ` WHERE `;

            for(var key in where) {
                //var op =  where[key].indexOf(',') != -1 ? ' IN ' : '=';
                var op = "=";
                //escapeId() for escaping column names
                var col = app.db.mysql.escapeId(key);
                var val = app.db.mysql.escape(where[key]);
                qr += ` ${col} ${op} ${val} AND`;
            }

            qr = qr.slice(0,-3);
        }

        if(!app.lib._.isEmpty(sort)) {
            qr += ` ORDER BY `;

            for(var key in sort) {
                qr += `${key}  ${sort[key]} ,`;
            }

            qr = qr.slice(0,-1);
        }

        if(limit) {
            qr += ` LIMIT ${offset}, ${limit}`;
        }

        console.log("fqr",qr)

        app.db.mysql.query(qr, cb)
    }

    insert(table, objValues, cb) {
        console.log("INSERT",table, objValues)
        app.db.mysql.query(`INSERT INTO ${table} SET ?`, objValues, cb);
    }

    update(table, objValues, ObjWhere, cb) {
        console.log("UPDATE",table, objValues, ObjWhere)
        app.db.mysql.query(`UPDATE ${table} SET ? WHERE ?`, [objValues, ObjWhere], cb);
    }

    delete(table, where, cb) {
        if(!app.lib._.isEmpty(where)) {
            qr += ` WHERE `;

            for(var key in where) {
                //var op =  where[key].indexOf(',') != -1 ? ' IN ' : '=';
                var op = "=";
                //escapeId() for escaping column names
                var col = app.db.mysql.escapeId(key);
                var val = app.db.mysql.escape(where[key]);
                qr += `${col} ${op} ${val} AND`;
            }

            qr = qr.slice(0,-3);
        }
    } 
}

module.exports = Base;