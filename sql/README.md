# Growbase Database Setup

Diese SQL-Dateien enthalten die notwendigen Datenbankschemas für Growbase.

## Ausführungsreihenfolge

1. **01_create_users_table.sql** - Erstellt die users-Tabelle
2. **02_rls_policies.sql** - Erstellt Row Level Security Policies
3. **03_triggers.sql** - Erstellt Trigger für automatische Benutzerverwaltung

## Anweisungen

1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu "SQL Editor"
3. Führe die SQL-Dateien in der angegebenen Reihenfolge aus
4. Aktiviere Google OAuth in Authentication > Providers

## Was wird erstellt

- **users Tabelle**: Erweitert auth.users mit benutzerdefinierten Feldern (name, etc.)
- **RLS Policies**: Sicherheitsrichtlinien für Datenzugriff
- **Trigger**: Automatische Benutzererstellung bei Registrierung
- **Indizes**: Für bessere Performance

## Google OAuth Setup

1. Gehe zu Authentication > Providers
2. Aktiviere Google Provider
3. Füge deine Google OAuth Credentials hinzu
4. Setze Redirect URL: `https://your-project.supabase.co/auth/v1/callback`