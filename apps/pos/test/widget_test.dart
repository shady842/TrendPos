import 'package:flutter_test/flutter_test.dart';
import 'package:trendpos_pos/main.dart';

void main() {
  testWidgets('app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const TrendPosPosApp());
    expect(find.text('TrendPos POS (MVP)'), findsOneWidget);
  });
}
