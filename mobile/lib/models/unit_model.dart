class UnitModel {
  final String id;
  final String tagNumber;
  final String projectName;
  final String unitType;
  final String brand;
  final String model;
  final String capacity;
  final String status;
  final String area;

  UnitModel({
    required this.id,
    required this.tagNumber,
    required this.projectName,
    required this.unitType,
    required this.brand,
    required this.model,
    required this.capacity,
    required this.status,
    required this.area,
  });

  factory UnitModel.fromJson(Map<String, dynamic> json) {
    return UnitModel(
      id: json['id'].toString(),
      tagNumber: json['tag_number'] ?? 'NO-TAG',
      projectName: json['projectName'] ?? 'No Project',
      unitType: json['unit_type'] ?? 'Uncategorized',
      brand: json['brand'] ?? 'Daikin',
      model: json['model'] ?? '',
      capacity: json['capacity'] ?? '',
      status: json['status'] ?? 'Normal',
      area: json['area'] ?? 'General',
    );
  }
}
