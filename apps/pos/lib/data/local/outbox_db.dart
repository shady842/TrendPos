import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

/// MVP offline queue: enqueue JSON payloads and flush when online.
class OutboxDb {
  OutboxDb._();
  static final OutboxDb instance = OutboxDb._();

  Database? _db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    final dir = await getDatabasesPath();
    final path = p.join(dir, 'trendpos_outbox.db');
    _db = await openDatabase(
      path,
      version: 1,
      onCreate: (db, v) async {
        await db.execute('''
          CREATE TABLE outbox (
            id TEXT PRIMARY KEY,
            path TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        ''');
      },
    );
    return _db!;
  }

  Future<void> enqueue(String id, String path, String body) async {
    final db = await database;
    await db.insert('outbox', {
      'id': id,
      'path': path,
      'body': body,
      'created_at': DateTime.now().millisecondsSinceEpoch,
    });
  }

  Future<List<Map<String, Object?>>> pending() async {
    final db = await database;
    return db.query('outbox', orderBy: 'created_at ASC');
  }

  Future<void> remove(String id) async {
    final db = await database;
    await db.delete('outbox', where: 'id = ?', whereArgs: [id]);
  }
}
