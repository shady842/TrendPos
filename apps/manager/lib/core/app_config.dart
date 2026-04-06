/// Same API as POS. Emulator: 10.0.2.2; device: --dart-define=API_BASE=...
class AppConfig {
  AppConfig._();
  static const String apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://10.0.2.2:4000',
  );
  static String get apiPrefix => '$apiBase/api';
}
