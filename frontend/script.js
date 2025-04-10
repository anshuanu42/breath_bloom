// Common functions
function getUserEmail() {
    const email = localStorage.getItem('userEmail');
    console.log('Retrieved user email from localStorage:', email);
    return email;
}

function setUserEmail(email) {
    localStorage.setItem('userEmail', email);
    console.log('User email set in localStorage:', localStorage.getItem('userEmail'));
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function logout() {
    localStorage.removeItem('userEmail');
    console.log('User logged out, localStorage cleared');
    window.location.href = 'index.html';
}

// Check authentication state on page load
if (window.location.pathname.includes('city.html') || window.location.pathname.includes('main.html') || window.location.pathname.includes('profile.html')) {
    const email = getUserEmail();
    if (!email) {
        window.location.href = 'index.html';
    }
}

// Login Page
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    console.log('Login form found:', loginForm);

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submission prevented');

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const age = document.getElementById('age').value;

            console.log('Login attempt with:', { username, email, password, age });

            if (!username || !email || !password || !age) {
                alert('Please fill in all fields');
                console.log('Validation failed: Missing fields');
                return;
            }

            try {
                console.log('Sending fetch request to /api/login');
                const response = await fetch('http://127.0.0.1:5000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password, age })
                });

                console.log('Fetch response status:', response.status);
                const data = await response.json();
                console.log('Fetch response data:', data);

                if (response.ok) {
                    console.log('Login successful, setting user email');
                    setUserEmail(email);
                    console.log('Redirecting to city.html');
                    window.location.href = 'city.html';
                } else {
                    console.log('Login failed:', data.error);
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Login fetch error:', error);
                alert('An error occurred during login. Please check the console for details.');
                console.log('Attempting fallback redirect to city.html');
                window.location.href = 'city.html';
            }
        });
    } else {
        console.error('Login form not found in the DOM');
    }

    loadTheme();
}

// Sign-Up Page
if (document.getElementById('signup-form')) {
    const signupForm = document.getElementById('signup-form');
    console.log('Signup form found:', signupForm);

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submission prevented');

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const age = document.getElementById('age').value;

            console.log('Signup attempt with:', { username, email, password, age });

            if (!username || !email || !password || !age) {
                alert('Please fill in all fields');
                console.log('Validation failed: Missing fields');
                return;
            }

            try {
                console.log('Sending fetch request to /api/signup');
                const response = await fetch('http://127.0.0.1:5000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password, age })
                });

                console.log('Fetch response status:', response.status);
                const data = await response.json();
                console.log('Fetch response data:', data);

                if (response.ok) {
                    console.log('Signup successful, setting user email');
                    setUserEmail(email);
                    console.log('Redirecting to city.html');
                    window.location.href = 'city.html';
                } else {
                    console.log('Signup failed:', data.error);
                    alert(data.error || 'Signup failed');
                }
            } catch (error) {
                console.error('Signup fetch error:', error);
                alert('An error occurred during signup. Please check the console for details.');
                console.log('Attempting fallback redirect to city.html');
                window.location.href = 'city.html';
            }
        });
    } else {
        console.error('Signup form not found in the DOM');
    }

    loadTheme();
}

// City Selection Page
if (document.getElementById('city-select')) {
    console.log('City selection page loaded');
    fetch('http://127.0.0.1:5000/api/cities')
        .then(response => {
            console.log('Cities fetch response status:', response.status);
            return response.json();
        })
        .then(cities => {
            console.log('Cities fetched:', cities);
            const citySelect = document.getElementById('city-select');
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Fetch cities error:', error));

    const submitCityButton = document.getElementById('submit-city');
    if (submitCityButton) {
        submitCityButton.addEventListener('click', async () => {
            const city = document.getElementById('city-select').value;
            const email = getUserEmail();
            console.log('City selection attempt:', { city, email });

            if (!city) {
                alert('Please select a city');
                console.log('Validation failed: No city selected');
                return;
            }

            if (!email) {
                alert('User email not found. Please log in or sign up again.');
                console.log('Validation failed: No email in localStorage');
                window.location.href = 'index.html';
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:5000/api/select-city', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, city })
                });
                const data = await response.json();
                console.log('Select city response:', data);

                if (response.ok) {
                    console.log('Redirecting to main.html');
                    window.location.href = 'main.html';
                } else {
                    alert(data.error || 'Failed to select city');
                }
            } catch (error) {
                console.error('Select city error:', error);
                alert('An error occurred while selecting the city');
            }
        });
    } else {
        console.error('Submit city button not found in the DOM');
    }

    loadTheme();
}

// Main Page
if (document.getElementById('aqi-value')) {
    const email = getUserEmail();
    let userData = null;
    let currentTask = null;
    let aqiChart = null;

    const taskModal = document.getElementById('task-verification-modal');
    const closeTaskModal = taskModal.querySelector('.close');
    const submitVerification = document.getElementById('submit-verification');
    const aqiValue = document.getElementById('aqi-value');

    const effectModal = document.getElementById('effect-details-modal');
    const closeEffectModal = effectModal.querySelector('.close');

    if (closeTaskModal) {
        closeTaskModal.onclick = function() {
            taskModal.style.display = 'none';
        };
    }

    if (closeEffectModal) {
        closeEffectModal.onclick = function() {
            effectModal.style.display = 'none';
        };
    }

    window.onclick = function(event) {
        if (event.target == taskModal) {
            taskModal.style.display = 'none';
        }
        if (event.target == effectModal) {
            effectModal.style.display = 'none';
        }
    };

    // Define AQI effects with descriptions and prevention tips
    const AQI_EFFECTS = {
        "good": [
            {
                name: "Minimal Impact",
                icon: "respiratory-icon",
                description: "Air quality is satisfactory, and air pollution poses little or no risk.",
                prevention: "No specific precautions needed. Enjoy outdoor activities!"
            }
        ],
        "moderate": [
            {
                name: "Mild Respiratory Irritation",
                icon: "respiratory-icon",
                description: "Unusually sensitive people may experience mild respiratory irritation.",
                prevention: "Sensitive individuals should consider reducing prolonged outdoor exertion."
            }
        ],
        "unhealthy-sensitive": [
            {
                name: "Respiratory Issues",
                icon: "respiratory-icon",
                description: "Increased likelihood of respiratory symptoms in sensitive groups (e.g., children, elderly, those with asthma).",
                prevention: "Sensitive groups should reduce outdoor exertion, especially during peak pollution hours. Use air purifiers indoors."
            },
            {
                name: "Eye Irritation",
                icon: "visibility-icon",
                description: "Possible eye irritation due to pollutants like dust and smoke.",
                prevention: "Wear protective eyewear outdoors and use eye drops if irritation occurs."
            }
        ],
        "unhealthy": [
            {
                name: "Severe Respiratory Issues",
                icon: "respiratory-icon",
                description: "Increased respiratory effects in the general population, particularly for those with pre-existing conditions.",
                prevention: "Limit outdoor activities, wear a mask (N95 if possible), and use air purifiers indoors."
            },
            {
                name: "Cardiovascular Strain",
                icon: "cardiovascular-icon",
                description: "Increased risk of cardiovascular issues, such as heart attacks, in vulnerable individuals.",
                prevention: "Avoid strenuous outdoor activities, monitor heart health, and consult a doctor if symptoms arise."
            },
            {
                name: "Reduced Visibility",
                icon: "visibility-icon",
                description: "Haze and smog can reduce visibility, posing risks for driving and outdoor activities.",
                prevention: "Use fog lights while driving, avoid unnecessary travel, and stay indoors if visibility is poor."
            }
        ],
        "very-unhealthy": [
            {
                name: "Serious Respiratory Problems",
                icon: "respiratory-icon",
                description: "Serious respiratory issues, including aggravated asthma and bronchitis, affecting the general population.",
                prevention: "Stay indoors, use air purifiers, wear a mask if you must go outside, and seek medical attention if symptoms worsen."
            },
            {
                name: "Heart and Lung Damage",
                icon: "cardiovascular-icon",
                description: "Significant risk of heart and lung damage, especially for those with chronic conditions.",
                prevention: "Avoid all outdoor activities, keep windows closed, and consult a healthcare provider for any symptoms."
            },
            {
                name: "Severe Visibility Issues",
                icon: "visibility-icon",
                description: "Severe reduction in visibility due to heavy pollution, increasing accident risks.",
                prevention: "Avoid driving or outdoor activities, use indoor lighting, and wait for conditions to improve."
            }
        ],
        "hazardous": [
            {
                name: "Critical Respiratory Failure",
                icon: "respiratory-icon",
                description: "Emergency conditions with a high risk of respiratory failure, even in healthy individuals.",
                prevention: "Remain indoors with sealed windows, use high-quality air purifiers, and seek immediate medical help for breathing difficulties."
            },
            {
                name: "Cardiovascular Emergencies",
                icon: "cardiovascular-icon",
                description: "High risk of heart attacks, strokes, and other cardiovascular emergencies.",
                prevention: "Avoid all physical activity, monitor symptoms closely, and contact emergency services if needed."
            },
            {
                name: "Dangerous Visibility Loss",
                icon: "visibility-icon",
                description: "Near-zero visibility due to extreme pollution, making outdoor activities extremely dangerous.",
                prevention: "Stay indoors, avoid travel, and wait for air quality to improve before going outside."
            }
        ]
    };

    async function fetchUserData() {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/user?email=${email}`);
            const data = await response.json();
            if (response.ok) {
                userData = data;
                document.getElementById('location').textContent = data.city || 'Not selected';
                document.getElementById('bloom-points').textContent = data.bloom_points;
                fetchAqi(data.city);
                loadTasks(data.age, data.city);
                updateBadgeProgress(data.bloom_points);
            } else {
                alert(data.error || 'Failed to fetch user data');
            }
        } catch (error) {
            console.error('Fetch user data error:', error);
            alert('An error occurred while fetching user data');
        }
    }

    async function fetchAqi(city) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/aqi?city=${city}`);
            const data = await response.json();
            if (data.status === 'ok') {
                const aqi = data.data.aqi;
                aqiValue.textContent = aqi;

                // Determine AQI category and apply corresponding class
                const aqiDisplay = document.querySelector('.aqi-display');
                const effectsSection = document.querySelector('.effects');
                let aqiCategory = '';
                let aqiDescription = '';

                if (aqi <= 50) {
                    aqiCategory = 'good';
                    aqiDescription = 'Good';
                } else if (aqi <= 100) {
                    aqiCategory = 'moderate';
                    aqiDescription = 'Moderate';
                } else if (aqi <= 150) {
                    aqiCategory = 'unhealthy-sensitive';
                    aqiDescription = 'Unhealthy for Sensitive Groups';
                } else if (aqi <= 200) {
                    aqiCategory = 'unhealthy';
                    aqiDescription = 'Unhealthy';
                } else if (aqi <= 300) {
                    aqiCategory = 'very-unhealthy';
                    aqiDescription = 'Very Unhealthy';
                } else {
                    aqiCategory = 'hazardous';
                    aqiDescription = 'Hazardous';
                }

                // Remove existing AQI classes and apply the new one
                aqiDisplay.classList.remove('good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'very-unhealthy', 'hazardous');
                aqiDisplay.classList.add(aqiCategory);
                effectsSection.classList.remove('good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'very-unhealthy', 'hazardous');
                effectsSection.classList.add(aqiCategory);

                document.getElementById('aqi-description').textContent = aqiDescription;
                document.getElementById('progress').style.width = `${Math.min(aqi / 300 * 100, 100)}%`;

                // Update AQI effects
                updateEffects(aqi, aqiCategory);
                loadTasks(userData.age, city);
                fetchAqiHistory(city);
            } else {
                aqiValue.textContent = 'Error';
                document.getElementById('aqi-description').textContent = 'Failed to fetch AQI';
            }
        } catch (error) {
            console.error('Fetch AQI error:', error);
            aqiValue.textContent = 'Error';
            document.getElementById('aqi-description').textContent = 'Failed to fetch AQI';
        }
    }

    async function fetchAqiHistory(city) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/aqi-history?city=${city}`);
            const data = await response.json();
            if (data.status === 'ok') {
                const ctx = document.getElementById('aqi-history-chart').getContext('2d');
                if (aqiChart) {
                    aqiChart.destroy();
                }
                aqiChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.data.labels,
                        datasets: [{
                            label: 'AQI',
                            data: data.data.history,
                            borderColor: '#81c784',
                            backgroundColor: 'rgba(129, 199, 132, 0.2)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'AQI Value',
                                    color: '#3a5a40'
                                },
                                ticks: {
                                    color: '#588157'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Days',
                                    color: '#3a5a40'
                                },
                                ticks: {
                                    color: '#588157'
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#3a5a40'
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Fetch AQI history error:', error);
        }
    }

    function updateEffects(aqi, aqiCategory) {
        const effectsList = document.getElementById('effects-list');
        effectsList.innerHTML = '';

        const effects = AQI_EFFECTS[aqiCategory];
        effects.forEach(effect => {
            const effectRow = document.createElement('div');
            effectRow.classList.add('effect-row');
            effectRow.innerHTML = `
                <div class="${effect.icon} effect-icon"></div>
                <span>${effect.name}</span>
            `;
            effectRow.addEventListener('click', () => {
                document.getElementById('effect-title').textContent = effect.name;
                document.getElementById('effect-description').textContent = `Description: ${effect.description}`;
                document.getElementById('effect-prevention').textContent = `Prevention: ${effect.prevention}`;
                effectModal.style.display = 'block';
            });
            effectsList.appendChild(effectRow);
        });

        // Apply animations based on AQI
        const respiratoryIcon = document.querySelector('#effects-list .respiratory-icon');
        const cardiovascularIcon = document.querySelector('#effects-list .cardiovascular-icon');
        const visibilityIcon = document.querySelector('#effects-list .visibility-icon');

        if (respiratoryIcon) respiratoryIcon.classList.toggle('shake', aqi > 50);
        if (cardiovascularIcon) cardiovascularIcon.classList.toggle('pulse', aqi > 100);
        if (visibilityIcon) visibilityIcon.classList.toggle('fade', aqi > 150);
    }

    function updateBadgeProgress(points) {
        const badgeProgress = document.getElementById('badge-progress');
        const badgeProgressText = document.getElementById('badge-progress-text');
        const nextBadge = BADGES.find(badge => points < badge.points) || BADGES[BADGES.length - 1];
        const previousBadgePoints = BADGES.find(badge => badge.points <= points) ? BADGES.find(badge => badge.points <= points).points : 0;
        const pointsToNextBadge = nextBadge.points - previousBadgePoints;
        const pointsEarned = points - previousBadgePoints;
        const progressPercentage = (pointsEarned / pointsToNextBadge) * 100;

        badgeProgress.style.width = `${Math.min(progressPercentage, 100)}%`;
        badgeProgressText.textContent = `Next Badge: ${nextBadge.name} (${pointsEarned}/${pointsToNextBadge} points to go)`;
    }

    async function loadTasks(age, city) {
        const response = await fetch(`http://127.0.0.1:5000/api/aqi?city=${city}`);
        const data = await response.json();
        const aqi = data.data.aqi;
        const ageGroup = age <= 12 ? 'children' : age <= 19 ? 'teenagers' : 'adults';
        const aqiRange = aqi <= 50 ? '0-50' : aqi <= 100 ? '51-100' : aqi <= 150 ? '101-150' : aqi <= 200 ? '151-200' : aqi <= 300 ? '201-300' : '301+';
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        TASKS[ageGroup][aqiRange].forEach(taskObj => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="task-info">
                    <span>${taskObj.task}</span>
                    <span class="task-points">+${taskObj.points} Bloom Points</span>
                </div>
            `;
            const button = document.createElement('button');
            button.innerHTML = '<i class="fas fa-check"></i> Complete';
            button.addEventListener('click', () => {
                currentTask = taskObj;
                taskModal.style.display = 'block';
            });
            li.appendChild(button);
            taskList.appendChild(li);
        });
    }

    if (submitVerification) {
        submitVerification.addEventListener('click', async () => {
            const mediaInput = document.getElementById('task-media');
            const file = mediaInput.files[0];
            if (!file) {
                alert('Please upload a photo or video to verify the task');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:5000/api/complete-task', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, task: currentTask.task, points: currentTask.points })
                });
                const data = await response.json();
                if (response.ok) {
                    const previousBadges = userData.badges;
                    userData = data.user;
                    document.getElementById('bloom-points').textContent = userData.bloom_points;
                    fetchAqi(userData.city);
                    updateBadgeProgress(userData.bloom_points);
                    setTimeout(() => {
                        taskModal.style.display = 'none';
                        document.getElementById('task-media').value = '';
                        loadTasks(userData.age, userData.city);
                    }, 1500);

                    const newBadges = userData.badges.filter(badge => !previousBadges.includes(badge));
                    if (newBadges.length > 0) {
                        newBadges.forEach(badge => {
                            showNotification(`Congratulations! You've earned the "${badge}" badge!`);
                        });
                    }
                } else {
                    alert(data.error || 'Failed to complete task');
                }
            } catch (error) {
                console.error('Complete task error:', error);
                alert('An error occurred while completing the task');
            }
        });
    }

    async function loadLeaderboard() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/leaderboard');
            const leaderboard = await response.json();
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = '';
            leaderboard.forEach((entry, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${index + 1}. ${entry.community}</span><span>${entry.points} Points</span>`;
                if (entry.community === 'Team Green') li.style.background = '#e0f7fa';
                leaderboardList.appendChild(li);
            });
        } catch (error) {
            console.error('Fetch leaderboard error:', error);
        }
    }

    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    fetchUserData();
    loadLeaderboard();
    loadTheme();
}

// Profile Page
if (document.getElementById('user-email')) {
    const email = getUserEmail();

    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const closeEditModal = editProfileModal.querySelector('.close');
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            editProfileModal.style.display = 'block';
            // Pre-fill the form with current user data
            document.getElementById('edit-username').value = document.getElementById('user-username').textContent;
            document.getElementById('edit-email').value = document.getElementById('user-email').textContent;
            document.getElementById('edit-age').value = document.getElementById('user-age').textContent;
            document.getElementById('edit-city').value = document.getElementById('user-city').textContent || '';
        });
    }

    if (closeEditModal) {
        closeEditModal.onclick = function() {
            editProfileModal.style.display = 'none';
        };
    }

    window.onclick = function(event) {
        if (event.target == editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    };

    async function loadProfile() {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/user?email=${email}`);
            const user = await response.json();
            if (response.ok) {
                document.getElementById('user-username').textContent = user.username;
                document.getElementById('user-email').textContent = user.email;
                document.getElementById('user-age').textContent = user.age;
                document.getElementById('user-city').textContent = user.city;
                document.getElementById('user-points').textContent = user.bloom_points;
                document.getElementById('user-tasks').textContent = user.tasks_completed;

                // Display profile image if it exists
                const profileImage = document.getElementById('profile-image');
                if (user.profile_image) {
                    profileImage.src = user.profile_image;
                    profileImage.style.display = 'block';
                } else {
                    profileImage.style.display = 'none';
                }

                const badgesList = document.getElementById('badges-list');
                badgesList.innerHTML = '';
                user.badges.forEach(badge => {
                    const li = document.createElement('li');
                    li.textContent = badge;
                    badgesList.appendChild(li);
                });

                const ageGroup = user.age <= 12 ? 'children' : user.age <= 19 ? 'teenagers' : 'adults';
                const rewardsList = document.getElementById('rewards-list');
                rewardsList.innerHTML = '';
                REWARDS[ageGroup].forEach(reward => {
                    const li = document.createElement('li');
                    li.innerHTML = `${reward.title} (${reward.points} Points)<br><small>${reward.description}</small>`;
                    const button = document.createElement('button');
                    button.innerHTML = '<i class="fas fa-gift"></i> Redeem';
                    button.addEventListener('click', async () => {
                        try {
                            const response = await fetch('http://127.0.0.1:5000/api/redeem-reward', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, reward: reward.title })
                            });
                            const data = await response.json();
                            if (response.ok) {
                                loadProfile();
                                showNotification(`Reward "${reward.title}" redeemed successfully!`);
                            } else {
                                alert(data.error || 'Failed to redeem reward');
                            }
                        } catch (error) {
                            console.error('Redeem reward error:', error);
                            alert('An error occurred while redeeming the reward');
                        }
                    });
                    li.appendChild(button);
                    rewardsList.appendChild(li);
                });

                const achievementsList = document.getElementById('achievements-list');
                achievementsList.innerHTML = '';
                user.rewards.forEach(reward => {
                    const li = document.createElement('li');
                    li.textContent = `Redeemed: ${reward}`;
                    achievementsList.appendChild(li);
                });

                const shareAchievementsBtn = document.getElementById('share-achievements');
                if (shareAchievementsBtn) {
                    shareAchievementsBtn.addEventListener('click', () => {
                        const shareText = `I've earned ${user.badges.length} badges on BreathBloom! 🌿 My latest badge: ${user.badges[user.badges.length - 1] || 'None yet'}. Join me in improving air quality!`;
                        if (navigator.share) {
                            navigator.share({
                                title: 'My BreathBloom Achievements',
                                text: shareText,
                                url: window.location.href
                            }).catch(error => console.error('Share error:', error));
                        } else {
                            navigator.clipboard.writeText(shareText).then(() => {
                                showNotification('Achievements copied to clipboard!');
                            }).catch(error => console.error('Clipboard error:', error));
                        }
                    });
                }
            } else {
                alert(user.error || 'Failed to fetch user data');
            }
        } catch (error) {
            console.error('Fetch user data error:', error);
            alert('An error occurred while fetching user data');
        }
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Edit profile form submission prevented');

            const newUsername = document.getElementById('edit-username').value;
            const newEmail = document.getElementById('edit-email').value;
            const newAge = document.getElementById('edit-age').value;
            const newCity = document.getElementById('edit-city').value;
            const profileImageInput = document.getElementById('edit-profile-image');
            let profileImage = '';

            if (profileImageInput.files[0]) {
                const file = profileImageInput.files[0];
                profileImage = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            }

            console.log('Updating profile with:', { email, newUsername, newEmail, newAge, newCity, profileImage });

            try {
                const response = await fetch('http://127.0.0.1:5000/api/update-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username: newUsername, new_email: newEmail, age: newAge, city: newCity, profile_image: profileImage })
                });
                const data = await response.json();
                console.log('Update profile response:', data);

                if (response.ok) {
                    setUserEmail(newEmail); // Update local storage with new email
                    editProfileModal.style.display = 'none';
                    loadProfile();
                    showNotification('Profile updated successfully!');
                } else {
                    alert(data.error || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Update profile error:', error);
                alert('An error occurred while updating the profile');
            }
        });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'main.html';
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    loadProfile();
    loadTheme();
}

// Global TASKS, REWARDS, and BADGES objects for frontend use
const TASKS = {
    "children": {
        "0-50": [
            {"task": "Create urban wind corridors", "points": 15},
            {"task": "Launch community air monitoring networks", "points": 20},
            {"task": "Plant native trees in parks", "points": 10}
        ],
        "51-100": [
            {"task": "Design eco-friendly toys", "points": 10},
            {"task": "Start a school recycling program", "points": 15},
            {"task": "Paint with natural dyes", "points": 10}
        ],
        "101-150": [
            {"task": "Organize a clean-up walk", "points": 15},
            {"task": "Build a birdhouse", "points": 10},
            {"task": "Learn about air filters", "points": 10}
        ],
        "151-200": [
            {"task": "Create car-free play zones", "points": 20},
            {"task": "Make a compost bin", "points": 15},
            {"task": "Join a tree-planting event", "points": 15}
        ],
        "201-300": [
            {"task": "Promote walking to school", "points": 15},
            {"task": "Create anti-pollution posters", "points": 10},
            {"task": "Participate in a green challenge", "points": 20}
        ],
        "301+": [
            {"task": "Assist in drone air quality surveys", "points": 25},
            {"task": "Design a pollution mask", "points": 15},
            {"task": "Help monitor local air", "points": 20}
        ]
    },
    "teenagers": {
        "0-50": [
            {"task": "Develop air cleaning bicycle paths", "points": 20},
            {"task": "Install solar-powered lights", "points": 15},
            {"task": "Organize a bike rally", "points": 15}
        ],
        "51-100": [
            {"task": "Apply eco-friendly paints", "points": 10},
            {"task": "Set up green roofs", "points": 20},
            {"task": "Conduct air quality workshops", "points": 15}
        ],
        "101-150": [
            {"task": "Implement remote work days", "points": 20},
            {"task": "Introduce traffic calming zones", "points": 15},
            {"task": "Launch a carpool initiative", "points": 15}
        ],
        "151-200": [
            {"task": "Deploy mobile air purifiers", "points": 25},
            {"task": "Enforce no-idling zones", "points": 15},
            {"task": "Monitor pollution hotspots", "points": 20}
        ],
        "201-300": [
            {"task": "Use drones for tree planting", "points": 25},
            {"task": "Promote public transit use", "points": 15},
            {"task": "Create air quality apps", "points": 20}
        ],
        "301+": [
            {"task": "Establish emergency bike lanes", "points": 25},
            {"task": "Lead pollution awareness campaigns", "points": 20},
            {"task": "Coordinate air filter drives", "points": 20}
        ]
    },
    "adults": {
        "0-50": [
            {"task": "Implement photocatalytic coatings", "points": 20},
            {"task": "Install air purifying billboards", "points": 25},
            {"task": "Design green building plans", "points": 20}
        ],
        "51-100": [
            {"task": "Enforce flexible work hours", "points": 15},
            {"task": "Deploy smog-eating cement", "points": 20},
            {"task": "Initiate urban forest projects", "points": 20}
        ],
        "101-150": [
            {"task": "Restrict high-emission vehicles", "points": 20},
            {"task": "Introduce congestion pricing", "points": 15},
            {"task": "Promote telecommuting", "points": 15}
        ],
        "151-200": [
            {"task": "Activate air purification towers", "points": 25},
            {"task": "Expand green wall installations", "points": 20},
            {"task": "Implement traffic rerouting", "points": 15}
        ],
        "201-300": [
            {"task": "Mandate remote work policies", "points": 20},
            {"task": "Apply maximum road tolls", "points": 15},
            {"task": "Deploy emergency air filters", "points": 25}
        ],
        "301+": [
            {"task": "Launch widespread drone spraying", "points": 30},
            {"task": "Create city-wide no-car zones", "points": 25},
            {"task": "Maximize all purification tech", "points": 30}
        ]
    }
};

const REWARDS = {
    "children": [
        {"title": "Eco-Friendly Coloring Book", "points": 30, "description": "A coloring book with nature themes."},
        {"title": "Plantable Seed Paper", "points": 50, "description": "Paper that grows into plants."},
        {"title": "Mini Gardening Kit", "points": 75, "description": "A kit to start your own garden."},
        {"title": "Eco-Friendly Backpack", "points": 100, "description": "Sustainable backpack for school."},
        {"title": "Nature Explorer Kit", "points": 150, "description": "Binoculars and a nature journal."},
        {"title": "Reusable Straw Set", "points": 200, "description": "Set of eco-friendly straws."}
    ],
    "teenagers": [
        {"title": "Reusable Face Mask", "points": 50, "description": "Sustainable face mask."},
        {"title": "Bamboo Water Bottle", "points": 75, "description": "Eco-friendly water bottle."},
        {"title": "Eco-Friendly Notebook", "points": 100, "description": "Notebook from recycled paper."},
        {"title": "Solar-Powered Phone Charger", "points": 150, "description": "Portable solar charger."},
        {"title": "Sustainable Sneakers", "points": 200, "description": "Sneakers from recycled materials."},
        {"title": "Eco-Friendly T-Shirt", "points": 250, "description": "Organic cotton t-shirt."}
    ],
    "adults": [
        {"title": "Air Purifying Plant", "points": 50, "description": "Plant that cleans indoor air."},
        {"title": "Smart Air Quality Monitor", "points": 100, "description": "Personal air quality device."},
        {"title": "Eco-Friendly Coffee Maker", "points": 150, "description": "Sustainable coffee maker."},
        {"title": "Solar Charger", "points": 200, "description": "Portable solar charging device."},
        {"title": "Eco-Friendly Home Kit", "points": 300, "description": "Kit with sustainable products."},
        {"title": "Reusable Laptop Sleeve", "points": 350, "description": "Eco-friendly laptop sleeve."}
    ]
};

const BADGES = [
    {"name": "Green Sprout", "points": 50, "description": "Earned 50 Bloom Points!"},
    {"name": "Eco Hero", "points": 100, "description": "Earned 100 Bloom Points!"},
    {"name": "Nature Champion", "points": 200, "description": "Earned 200 Bloom Points!"},
    {"name": "Air Guardian", "points": 300, "description": "Earned 300 Bloom Points!"},
    {"name": "Planet Protector", "points": 500, "description": "Earned 500 Bloom Points!"}
];