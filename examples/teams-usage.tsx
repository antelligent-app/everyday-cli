/**
 * Teams Usage Examples
 *
 * Demonstrates how to use the Teams functionality in the client-side package
 */

'use client';

import { useState, useEffect } from 'react';
import {
  EsDbClient,
  type EsTeam,
  type EsTeamMember
} from '@antelligent-app/everyday-cli/client';

// Initialize the client
const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
});

// ==================== EXAMPLE 1: Create and Manage Team ====================

export function CreateTeamExample() {
  const [teamName, setTeamName] = useState('');
  const [team, setTeam] = useState<EsTeam | null>(null);

  async function handleCreateTeam() {
    try {
      // Create a new team with the current user as owner
      const newTeam = await db.createTeam(teamName, undefined, ['owner']);
      setTeam(newTeam);
      alert(`Team "${newTeam.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create team:', error);
      alert('Failed to create team');
    }
  }

  async function handleUpdateTeamName() {
    if (!team) return;

    try {
      const updatedTeam = await db.updateTeamName(team.uid, 'New Team Name');
      setTeam(updatedTeam);
      alert('Team name updated!');
    } catch (error) {
      console.error('Failed to update team:', error);
    }
  }

  async function handleDeleteTeam() {
    if (!team) return;

    try {
      await db.deleteTeam(team.uid);
      setTeam(null);
      alert('Team deleted!');
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  }

  return (
    <div>
      <h2>Create Team</h2>
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Team name"
      />
      <button onClick={handleCreateTeam}>Create Team</button>

      {team && (
        <div>
          <h3>Team: {team.name}</h3>
          <p>ID: {team.uid}</p>
          <p>Members: {team.totalMembers}</p>
          <p>Created: {team.createdAt}</p>

          <button onClick={handleUpdateTeamName}>Rename Team</button>
          <button onClick={handleDeleteTeam}>Delete Team</button>
        </div>
      )}
    </div>
  );
}

// ==================== EXAMPLE 2: List User's Teams ====================

export function ListTeamsExample() {
  const [teams, setTeams] = useState<EsTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      try {
        const result = await db.listTeams();
        setTeams(result.items);
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);

  if (loading) return <div>Loading teams...</div>;

  return (
    <div>
      <h2>My Teams</h2>
      {teams.length === 0 ? (
        <p>You are not a member of any teams</p>
      ) : (
        <ul>
          {teams.map((team) => (
            <li key={team.uid}>
              <strong>{team.name}</strong>
              <span> ({team.totalMembers} members)</span>
              <small> - Created {new Date(team.createdAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ==================== EXAMPLE 3: Manage Team Members ====================

export function TeamMembersExample({ teamId }: { teamId: string }) {
  const [members, setMembers] = useState<EsTeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  useEffect(() => {
    loadMembers();
  }, [teamId]);

  async function loadMembers() {
    try {
      const result = await db.listTeamMembers(teamId);
      setMembers(result.items);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }

  async function handleInviteMember() {
    try {
      await db.createTeamMembership(teamId, inviteEmail, [inviteRole]);
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      loadMembers();
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to send invitation');
    }
  }

  async function handleUpdateMemberRole(membershipId: string, newRole: string) {
    try {
      await db.updateTeamMemberRoles(teamId, membershipId, [newRole]);
      alert('Member role updated!');
      loadMembers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  }

  async function handleRemoveMember(membershipId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await db.deleteTeamMembership(teamId, membershipId);
      alert('Member removed!');
      loadMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  }

  return (
    <div>
      <h2>Team Members</h2>

      {/* Invite Member Form */}
      <div>
        <h3>Invite Member</h3>
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Email address"
        />
        <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={handleInviteMember}>Send Invitation</button>
      </div>

      {/* Members List */}
      <div>
        <h3>Current Members ({members.length})</h3>
        {members.map((member) => (
          <div key={member.uid} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <p><strong>{member.userName}</strong> ({member.userEmail})</p>
            <p>Roles: {member.roles.join(', ')}</p>
            <p>Joined: {new Date(member.joined).toLocaleDateString()}</p>

            <button onClick={() => handleUpdateMemberRole(member.uid, 'admin')}>
              Make Admin
            </button>
            <button onClick={() => handleUpdateMemberRole(member.uid, 'member')}>
              Make Member
            </button>
            <button onClick={() => handleRemoveMember(member.uid)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== EXAMPLE 4: Complete Team Management Component ====================

export function TeamManagementPage() {
  const [selectedTeam, setSelectedTeam] = useState<EsTeam | null>(null);

  return (
    <div>
      <h1>Team Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Create & List Teams */}
        <div>
          <CreateTeamExample />
          <hr />
          <ListTeamsExample />
        </div>

        {/* Right Column: Manage Selected Team */}
        <div>
          {selectedTeam ? (
            <TeamMembersExample teamId={selectedTeam.uid} />
          ) : (
            <p>Select a team to manage members</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== EXAMPLE 5: Check Team Membership ====================

export async function checkUserTeamMembership(teamId: string, membershipId: string) {
  try {
    const membership = await db.getTeamMembership(teamId, membershipId);

    console.log('Membership details:', {
      user: membership.userName,
      email: membership.userEmail,
      team: membership.teamName,
      roles: membership.roles,
      joined: membership.joined
    });

    return membership;
  } catch (error) {
    console.error('Failed to get membership:', error);
    return null;
  }
}

// ==================== EXAMPLE 6: Team Roles Permission Helper ====================

export function TeamRoleChecker({ userRoles }: { userRoles: string[] }) {
  const isOwner = userRoles.includes('owner');
  const isAdmin = userRoles.includes('admin');
  const isMember = userRoles.includes('member');

  return (
    <div>
      <h3>Your Permissions</h3>
      <ul>
        <li>Can view team: {isMember || isAdmin || isOwner ? '✅' : '❌'}</li>
        <li>Can invite members: {isAdmin || isOwner ? '✅' : '❌'}</li>
        <li>Can remove members: {isOwner ? '✅' : '❌'}</li>
        <li>Can delete team: {isOwner ? '✅' : '❌'}</li>
      </ul>
    </div>
  );
}

// ==================== USAGE IN NEXT.JS PAGE ====================

/**
 * Example Next.js Page Component
 *
 * File: app/teams/page.tsx
 */
export default function TeamsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await db.getCurrentUser();
      setIsAuthenticated(!!user);

      if (!user) {
        window.location.href = '/login';
      }
    }

    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <TeamManagementPage />;
}
