'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface EmailEntry {
  college: string;
  email: string;
}

export default function PrincipalEmailsPage() {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ college: '', email: '' });
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ college: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/principal-emails');
      const data = await response.json();
      
      const emailArray = Object.entries(data).map(([college, email]) => ({
        college,
        email: email as string
      }));
      
      setEmails(emailArray);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...emails[index] });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ college: '', email: '' });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const oldCollege = emails[editingIndex!].college;
      
      // If college name changed, delete old entry first
      if (oldCollege !== editForm.college) {
        await fetch(`/api/principal-emails?college=${encodeURIComponent(oldCollege)}`, {
          method: 'DELETE'
        });
      }
      
      // Add/update the new entry
      const response = await fetch('/api/principal-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college: editForm.college,
          email: editForm.email
        })
      });

      if (response.ok) {
        await fetchEmails();
        setEditingIndex(null);
        setEditForm({ college: '', email: '' });
      }
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (college: string) => {
    if (!confirm(`Are you sure you want to delete the email for ${college}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/principal-emails?college=${encodeURIComponent(college)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchEmails();
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const handleAddNew = async () => {
    if (!newForm.college || !newForm.email) {
      alert('Please fill in both college name and email');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/principal-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college: newForm.college,
          email: newForm.email
        })
      });

      if (response.ok) {
        await fetchEmails();
        setAddingNew(false);
        setNewForm({ college: '', email: '' });
      }
    } catch (error) {
      console.error('Error adding email:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredEmails = emails.filter(entry =>
    entry.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Principal Email Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage email addresses for college principals
              </p>
            </div>
            <Link
              href="/admin/applications"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Applications
            </Link>
          </div>

          {/* Search and Add New Button */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by college or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setAddingNew(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              + Add New
            </button>
          </div>

          {/* Add New Form */}
          {addingNew && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6 border-2 border-green-500"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add New Principal Email
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College Name
                  </label>
                  <input
                    type="text"
                    value={newForm.college}
                    onChange={(e) => setNewForm({ ...newForm, college: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., LD College of Engineering, Ahmedabad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Principal Email
                  </label>
                  <input
                    type="email"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="principal@college.ac.in"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setAddingNew(false);
                    setNewForm({ college: '', email: '' });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Email List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      College Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Principal Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmails.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No matching emails found' : 'No principal emails configured'}
                      </td>
                    </tr>
                  ) : (
                    filteredEmails.map((entry, index) => {
                      const actualIndex = emails.findIndex(e => e.college === entry.college);
                      const isEditing = editingIndex === actualIndex;

                      return (
                        <tr key={entry.college} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.college}
                                onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {entry.college}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {entry.email}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                  disabled={saving}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  disabled={saving}
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(actualIndex)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.college)}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Total: {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
            {searchQuery && ` (filtered from ${emails.length})`}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
