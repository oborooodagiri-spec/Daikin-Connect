import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/customer_provider.dart';
import '../../projects/screens/project_list_screen.dart';

class CustomerListScreen extends StatefulWidget {
  const CustomerListScreen({super.key});

  @override
  State<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends State<CustomerListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CustomerProvider>().fetchCustomers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final customerProvider = Provider.of<CustomerProvider>(context);
    final filteredCustomers = customerProvider.customers.where((c) {
      return c['name'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
             (c['pic'] ?? '').toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "CLIENT REGISTRY",
          style: GoogleFonts.outfit(
            color: const Color(0xFF00A1E4),
            fontWeight: FontWeight.w900,
            letterSpacing: 4,
            fontSize: 12,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          _buildSearchHeader(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => customerProvider.refresh(),
              color: const Color(0xFF00A1E4),
              backgroundColor: const Color(0xFF040814),
              child: customerProvider.isLoading && filteredCustomers.isEmpty
                ? _buildLoadingState()
                : filteredCustomers.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredCustomers.length,
                      itemBuilder: (context, index) {
                        final customer = filteredCustomers[index];
                        return _buildCustomerCard(customer, index);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        borderRadius: 16,
        opacity: 0.1,
        child: TextField(
          controller: _searchController,
          onChanged: (v) => setState(() => _searchQuery = v),
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: "Search Client or PIC...",
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 14),
            border: InputBorder.none,
            icon: const Icon(Icons.search, color: Color(0xFF00A1E4), size: 20),
            suffixIcon: _searchQuery.isNotEmpty 
              ? IconButton(
                  icon: const Icon(Icons.close, color: Colors.white38, size: 16),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = "");
                  },
                )
              : null,
          ),
        ),
      ),
    );
  }

  Widget _buildCustomerCard(Map<String, dynamic> customer, int index) {
    return FadeInUp(
      delay: Duration(milliseconds: index * 100),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        child: InkWell(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(
              builder: (context) => ProjectListScreen(customer: customer)
            ));
          },
          borderRadius: BorderRadius.circular(24),
          child: GlassCard(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00A1E4).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF00A1E4).withOpacity(0.2)),
                  ),
                  child: const Icon(Icons.business, color: Color(0xFF00A1E4), size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customer['name']?.toUpperCase() ?? "UNKNOWN CLIENT",
                        style: GoogleFonts.outfit(
                          color: Colors.white, 
                          fontWeight: FontWeight.w800, 
                          fontSize: 14,
                          letterSpacing: 0.5
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.person_outline, color: Colors.white38, size: 12),
                          const SizedBox(width: 4),
                          Text(
                            customer['pic'] ?? 'No PIC',
                            style: const TextStyle(color: Colors.white38, fontSize: 11),
                          ),
                          const SizedBox(width: 12),
                          Icon(Icons.layers_outlined, color: const Color(0xFF00A1E4), size: 12),
                          const SizedBox(width: 4),
                          Text(
                            "${customer['project_count'] ?? 0} Projects",
                            style: const TextStyle(color: Color(0xFF00A1E4), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: Colors.white24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)));
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.query_stats, size: 64, color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 16),
          Text(
            "NO CLIENTS FOUND",
            style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.w900, letterSpacing: 2),
          ),
        ],
      ),
    );
  }
}
