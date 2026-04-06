/// Android emulator: use `http://10.0.2.2:4000` to reach host machine.
/// Physical device: use your PC LAN IP, e.g. `http://192.168.1.10:4000`.
class AppConfig {
  AppConfig._();

  static const String apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://10.0.2.2:4000',
  );

  static String get apiPrefix => '$apiBase/api';
}
