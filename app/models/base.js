class Base {
    fetch(table, columns = "*", where, sort, limit, offset, cb) {
        var qr = `SELECT ${columns} FROM ${table}` ;
        
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

        app.db.mysql.query(qr, cb)
    }

    insert(table, objValues, cb) {
        app.db.mysql.query(`INSERT INTO ${table} SET ?`, objValues, cb);
    }

    update(table, objValues, ObjWhere, cb) {
        app.db.mysql.query(`UPDATE ${table} SET ? WHERE ?`, [objValues, ObjWhere], cb);
    }

    delete(table, ObjWhere, cb) {
        app.db.mysql.query(`DELETE FROM ${table} WHERE ?`, [ObjWhere], cb);
    }

    delete2(table, where, cb) {
        var qr = `DELETE FROM ${table}` ;
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
            app.db.mysql.query(`D ${table} SET ? WHERE ?`, [objValues, ObjWhere], cb);
        }
        cb(null);
    } 
}

module.exports = Base;