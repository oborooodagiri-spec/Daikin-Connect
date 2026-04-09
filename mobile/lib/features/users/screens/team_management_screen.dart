import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../../../widgets/glass_widgets.dart';
import '../../../providers/user_provider.dart';

class TeamManagementScreen extends StatefulWidget {
  const TeamManagementScreen({super.key});

  @override
  State<TeamManagementScreen> createState() => _TeamManagementScreenState();
}

class _TeamManagementScreenState extends State<TeamManagementScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UserProvider>().fetchUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final filteredUsers = userProvider.users.where((u) {
      return u['name'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
             u['role'].toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF040814),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "PERSONNEL MATRIX",
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
          _buildSearchHeader(userProvider),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => userProvider.refresh(),
              color: const Color(0xFF00A1E4),
              backgroundColor: const Color(0xFF040814),
              child: userProvider.isLoading && filteredUsers.isEmpty
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF00A1E4)))
                : filteredUsers.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredUsers.length,
                      itemBuilder: (context, index) {
                        final user = filteredUsers[index];
                        return _buildUserCard(user, index);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchHeader(UserProvider provider) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
      child: Column(
        children: [
          GlassCard(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            borderRadius: 16,
            opacity: 0.1,
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _searchQuery = v),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: "Search Name or Role...",
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
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "${provider.users.length} ACTIVE PERSONNEL",
                style: GoogleFonts.outfit(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
              const Icon(Icons.manage_accounts_rounded, color: Colors.white24, size: 16),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user, int index) {
    final roleColor = _getRoleColor(user['role']);
    final isOnline = user['status'] == 'Active';

    return FadeInUp(
      delay: Duration(milliseconds: index * 50),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        child: GlassCard(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Stack(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: roleColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: roleColor.withOpacity(0.2)),
                    ),
                    child: Icon(Icons.person_rounded, color: roleColor, size: 26),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: isOnline ? Colors.emerald : Colors.white24,
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF040814), width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user['name']?.toUpperCase() ?? "UNKNOWN USER",
                      style: GoogleFonts.outfit(
                        color: Colors.white, 
                        fontWeight: FontWeight.w900, 
                        fontSize: 14,
                        letterSpacing: 0.5
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user['email'] ?? 'No Email',
                      style: const TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: roleColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            user['role'].toUpperCase(),
                            style: TextStyle(color: roleColor, fontSize: 8, fontWeight: FontWeight.black, letterSpacing: 1),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chat_bubble_outline_rounded, color: Color(0xFF00A1E4), size: 20),
                onPressed: () {
                  // Direct to chat with this person
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'admin': return Colors.red;
      case 'engineer': return Colors.blue;
      case 'vendor': return Colors.teal;
      case 'ste': return Colors.orange;
      case 'caps': return Colors.purple;
      default: return Colors.white24;
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.people_outline_rounded, size: 64, color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 16),
          Text(
            "NO PERSONNEL MATCH",
            style: GoogleFonts.outfit(color: Colors.white24, fontWeight: FontWeight.w900, letterSpacing: 2),
          ),
        ],
      ),
    );
  }
}
