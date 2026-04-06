import 'package:flutter_test/flutter_test.dart';
import 'package:trendpos_manager/main.dart';

void main() {
  testWidgets('loads', (tester) async {
    await tester.pumpWidget(const TrendPosManagerApp());
    expect(find.textContaining('Manager'), findsWidgets);
  });
}
