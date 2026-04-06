import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:uuid/uuid.dart';

import 'core/app_config.dart';
import 'data/local/outbox_db.dart';
import 'services/api_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const TrendPosPosApp());
}

class TrendPosPosApp extends StatelessWidget {
  const TrendPosPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TrendPos POS',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const PosHomePage(),
    );
  }
}

class PosHomePage extends StatefulWidget {
  const PosHomePage({super.key});

  @override
  State<PosHomePage> createState() => _PosHomePageState();
}

class _PosHomePageState extends State<PosHomePage> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _api = ApiService();
  io.Socket? _socket;
  String? _token;
  String? _branchId;
  String? _lastOrderId;
  String _log = 'Sign in, then sync or place order.';
  final _uuid = const Uuid();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _socket?.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() => _log = 'Signing in…');
    try {
      final data = await _api.login(_email.text.trim(), _password.text);
      final t = data['accessToken'] as String?;
      if (t == null) throw Exception('No accessToken');
      _token = t;
      _api.setToken(t);
      await _loadBranch();
      _connectSocket(t);
      setState(() => _log = 'Signed in. Branch: $_branchId');
    } catch (e) {
      setState(() => _log = 'Login failed: $e');
    }
  }

  Future<void> _loadBranch() async {
    final list = await _api.companiesMe();
    if (list.isEmpty) throw Exception('No companies');
    final m = list.first as Map<String, dynamic>;
    final company = m['company'] as Map<String, dynamic>?;
    final branches = company?['branches'] as List<dynamic>?;
    if (branches == null || branches.isEmpty) throw Exception('No branch');
    _branchId = (branches.first as Map<String, dynamic>)['id'] as String;
  }

  void _connectSocket(String token) {
    _socket?.dispose();
    final s = io.io(
      '${AppConfig.apiBase}/realtime',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .build(),
    );
    s.on('order:updated', (data) {
      setState(() => _log = 'Realtime: $data');
    });
    s.connect();
    _socket = s;
  }

  Future<void> _placeOrder() async {
    if (_branchId == null) {
      setState(() => _log = 'Sign in first');
      return;
    }
    final clientOrderId = _uuid.v4();
    final body = {
      'branchId': _branchId,
      'channel': 'dine_in',
      'clientOrderId': clientOrderId,
      'lines': [
        {
          'name': 'House burger',
          'quantity': 1,
          'unitPriceCents': 1299,
        },
      ],
    };
    try {
      final created = await _api.createOrder(body);
      _lastOrderId = created['id'] as String?;
      setState(() => _log = 'Order sent ($clientOrderId) id=$_lastOrderId');
    } catch (e) {
      await OutboxDb.instance.enqueue(
        clientOrderId,
        '/orders',
        jsonEncode(body),
      );
      setState(() => _log = 'Offline? Queued in outbox: $clientOrderId');
    }
  }

  Future<void> _requestDiscountApproval() async {
    final orderId = _lastOrderId;
    if (orderId == null) {
      setState(() => _log = 'Place an order first, then request approval.');
      return;
    }
    try {
      await _api.requestOrderApproval(
        orderId,
        type: 'discount',
        note: 'POS requested 5.00 discount',
        amountCents: 500,
      );
      setState(() => _log = 'Approval requested for order $orderId');
    } catch (e) {
      setState(() => _log = 'Approval request failed: $e');
    }
  }

  Future<void> _flushOutbox() async {
    if (_token == null) return;
    final rows = await OutboxDb.instance.pending();
    for (final r in rows) {
      final id = r['id']! as String;
      final body = r['body']! as String;
      try {
        await _api.createOrder(
          jsonDecode(body) as Map<String, dynamic>,
        );
        await OutboxDb.instance.remove(id);
      } catch (_) {
        break;
      }
    }
    setState(() => _log = 'Outbox flushed (or stopped on error)');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('TrendPos POS (MVP)')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('API: ${AppConfig.apiBase}',
              style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 12),
          TextField(
            controller: _email,
            decoration: const InputDecoration(labelText: 'Email'),
            keyboardType: TextInputType.emailAddress,
          ),
          TextField(
            controller: _password,
            decoration: const InputDecoration(labelText: 'Password'),
            obscureText: true,
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _login,
            child: const Text('Sign in'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: _placeOrder,
            child: const Text('Place order (burger)'),
          ),
          OutlinedButton(
            onPressed: _flushOutbox,
            child: const Text('Flush outbox'),
          ),
          OutlinedButton(
            onPressed: _requestDiscountApproval,
            child: const Text('Request discount approval'),
          ),
          const SizedBox(height: 16),
          Text(_log),
        ],
      ),
    );
  }
}
