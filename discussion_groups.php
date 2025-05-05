<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discussion Groups</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <h1>Discussion Groups</h1>
        
        <!-- Create Group Form -->
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title">Create New Group</h5>
                <form id="createGroupForm">
                    <div class="mb-3">
                        <label for="groupName" class="form-label">Group Name</label>
                        <input type="text" class="form-control" id="groupName" required>
                    </div>
                    <div class="mb-3">
                        <label for="groupDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="groupDescription" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Create Group</button>
                </form>
            </div>
        </div>

        <!-- Groups List -->
        <div id="groupsList" class="row">
            <!-- Groups will be loaded here -->
        </div>
    </div>

    <!-- Templates -->
    <template id="groupCardTemplate">
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title"></h5>
                    <p class="card-text"></p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <span class="member-count"></span> members
                        </small>
                        <button class="btn btn-primary join-btn">Join Group</button>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <!-- Scripts -->
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/discussion-groups.js"></script>
    <script>
        // Initialize the page
        document.addEventListener('DOMContentLoaded', async () => {
            const courseId = new URLSearchParams(window.location.search).get('course_id') || 1;
            
            try {
                // Load discussion groups
                const groups = await DiscussionGroups.getGroups(courseId);
                displayGroups(groups);
            } catch (error) {
                console.error('Error loading groups:', error);
                alert('Failed to load discussion groups. Please try again.');
            }

            // Handle create group form submission
            document.getElementById('createGroupForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('groupName').value;
                const description = document.getElementById('groupDescription').value;
                
                try {
                    const newGroup = await DiscussionGroups.createGroup({
                        name,
                        description,
                        course_id: courseId
                    });
                    
                    // Add new group to the list
                    const groups = await DiscussionGroups.getGroups(courseId);
                    displayGroups(groups);
                    
                    // Reset form
                    e.target.reset();
                } catch (error) {
                    console.error('Error creating group:', error);
                    alert('Failed to create group. Please try again.');
                }
            });
        });

        // Display groups in the UI
        function displayGroups(groups) {
            const container = document.getElementById('groupsList');
            const template = document.getElementById('groupCardTemplate');
            
            container.innerHTML = '';
            
            groups.forEach(group => {
                const clone = template.content.cloneNode(true);
                
                clone.querySelector('.card-title').textContent = group.name;
                clone.querySelector('.card-text').textContent = group.description;
                clone.querySelector('.member-count').textContent = group.member_count;
                
                const joinBtn = clone.querySelector('.join-btn');
                joinBtn.addEventListener('click', async () => {
                    try {
                        await DiscussionGroups.joinGroup(group.id);
                        alert('Successfully joined the group!');
                        // Refresh the groups list
                        const updatedGroups = await DiscussionGroups.getGroups(group.course_id);
                        displayGroups(updatedGroups);
                    } catch (error) {
                        console.error('Error joining group:', error);
                        alert('Failed to join group. Please try again.');
                    }
                });
                
                container.appendChild(clone);
            });
        }
    </script>
</body>
</html> 