import 'package:dio/dio.dart';
import '../core/app_config.dart';

class ApiService {
  ApiService() : _dio = Dio(BaseOptions(baseUrl: AppConfig.apiPrefix));

  final Dio _dio;
  String? _accessToken;

  void setToken(String? t) => _accessToken = t;

  Map<String, String> get _headers => {
        if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
        'Content-Type': 'application/json',
      };

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email, 'password': password},
      options: Options(
        headers: {'Content-Type': 'application/json'},
      ),
    );
    return res.data ?? {};
  }

  Future<List<dynamic>> companiesMe() async {
    final res = await _dio.get<List<dynamic>>(
      '/companies/me',
      options: Options(headers: _headers),
    );
    return res.data ?? [];
  }

  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> body) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/orders',
      data: body,
      options: Options(headers: _headers),
    );
    return res.data ?? {};
  }

  Future<Map<String, dynamic>> requestOrderApproval(
    String orderId, {
    required String type,
    String? note,
    int? amountCents,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/orders/$orderId/request-approval',
      data: {
        'type': type,
        'note': note,
        'amountCents': amountCents?.toString(),
      },
      options: Options(headers: _headers),
    );
    return res.data ?? {};
  }
}
