import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'core/app_config.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const TrendPosManagerApp());
}

class TrendPosManagerApp extends StatelessWidget {
  const TrendPosManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TrendPos Manager',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const ManagerHomePage(),
    );
  }
}

/// Phase 3: wire to GET /approvals, approve/reject actions, FCM.
class ManagerHomePage extends StatefulWidget {
  const ManagerHomePage({super.key});

  @override
  State<ManagerHomePage> createState() => _ManagerHomePageState();
}

class _ManagerHomePageState extends State<ManagerHomePage> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _reason = TextEditingController(text: 'Need manager decision');
  final _dio = Dio(BaseOptions(baseUrl: AppConfig.apiPrefix));
  io.Socket? _socket;
  String? _token;
  String? _companyId;
  String _status = 'Sign in to load pending approvals.';
  List<Map<String, dynamic>> _approvals = [];

  Future<void> _login() async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'email': _email.text.trim(),
          'password': _password.text,
        },
      );
      final t = res.data?['accessToken'] as String?;
      setState(() {
        _token = t;
        _status = t != null ? 'Signed in. Loading company + approvals...' : 'No token';
      });
      await _loadCompanyAndApprovals();
    } catch (e) {
      setState(() => _status = 'Error: $e');
    }
  }

  Options get _authOptions => Options(
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
      );

  Future<void> _loadCompanyAndApprovals() async {
    if (_token == null) return;
    try {
      final res = await _dio.get<List<dynamic>>('/companies/me', options: _authOptions);
      final list = (res.data ?? []).cast<dynamic>();
      if (list.isEmpty) {
        setState(() => _status = 'No company memberships');
        return;
      }
      final first = list.first as Map<String, dynamic>;
      final company = first['company'] as Map<String, dynamic>? ?? {};
      _companyId = company['id'] as String?;
      _connectRealtime();
      await _loadApprovals();
    } catch (e) {
      setState(() => _status = 'Load failed: $e');
    }
  }

  void _connectRealtime() {
    final token = _token;
    if (token == null) return;
    _socket?.dispose();
    final s = io.io(
      '${AppConfig.apiBase}/realtime',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .build(),
    );
    s.on('approval:updated', (_) async {
      await _loadApprovals();
      if (mounted) {
        setState(() => _status = 'Realtime: approval update received');
      }
    });
    s.connect();
    _socket = s;
  }

  Future<void> _loadApprovals() async {
    if (_token == null || _companyId == null) return;
    try {
      final res = await _dio.get<List<dynamic>>(
        '/approvals',
        queryParameters: {'companyId': _companyId, 'status': 'pending'},
        options: _authOptions,
      );
      setState(() {
        _approvals =
            (res.data ?? []).map((e) => (e as Map).cast<String, dynamic>()).toList();
        _status = 'Loaded ${_approvals.length} pending approvals';
      });
    } catch (e) {
      setState(() => _status = 'Approvals load failed: $e');
    }
  }

  Future<void> _createApproval() async {
    if (_token == null || _companyId == null) return;
    try {
      await _dio.post(
        '/approvals',
        data: {
          'companyId': _companyId,
          'type': 'discount',
          'payload': {
            'note': _reason.text,
            'amountCents': 500,
          },
        },
        options: _authOptions,
      );
      await _loadApprovals();
    } catch (e) {
      setState(() => _status = 'Create failed: $e');
    }
  }

  Future<void> _decide(String approvalId, String decision) async {
    if (_token == null) return;
    try {
      await _dio.post(
        '/approvals/$approvalId/decision',
        data: {
          'status': decision,
          'note': decision == 'approved' ? 'Approved in manager app' : 'Rejected in manager app',
        },
        options: _authOptions,
      );
      await _loadApprovals();
    } catch (e) {
      setState(() => _status = 'Decision failed: $e');
    }
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _reason.dispose();
    _socket?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('TrendPos Manager')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('API ${AppConfig.apiBase}',
              style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 16),
          TextField(
            controller: _email,
            decoration: const InputDecoration(labelText: 'Email'),
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
          if (_token != null) ...[
            TextField(
              controller: _reason,
              decoration: const InputDecoration(labelText: 'New approval reason'),
            ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: _createApproval,
              child: const Text('Create discount approval'),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: _loadApprovals,
              child: const Text('Refresh pending approvals'),
            ),
          ],
          const SizedBox(height: 16),
          Text(_status),
          const SizedBox(height: 8),
          ..._approvals.map(
            (a) => Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${a['type']} · ${a['status']}'),
                    const SizedBox(height: 4),
                    Text('${a['payload']}',
                        style: Theme.of(context).textTheme.bodySmall),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        FilledButton.tonal(
                          onPressed: () =>
                              _decide(a['id'] as String, 'approved'),
                          child: const Text('Approve'),
                        ),
                        const SizedBox(width: 8),
                        FilledButton.tonal(
                          onPressed: () =>
                              _decide(a['id'] as String, 'rejected'),
                          child: const Text('Reject'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
