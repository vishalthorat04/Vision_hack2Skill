// CareerCoach AI Application Logic
class CareerCoachAI {
    constructor() {
        this.currentPhase = 1;
        this.currentQuestionIndex = 0;
        this.userResponses = [];
        this.conversationData = {
            phases: {
                phase1: {
                    title: "Assessment",
                    opening: "Hi! I'm CareerCoach AI, and I'm here to help you discover career paths that truly fit who you are. We'll spend about 15-20 minutes exploring your values, strengths, and preferences, then I'll provide personalized career recommendations with actionable next steps. Ready to begin?\n\nLet's start with what drives you: What energizes you most - what activities or types of work make you feel excited and engaged?",
                    questions: [
                        "What values are non-negotiable in your career? (creativity, stability, helping others, autonomy, recognition, etc.)",
                        "Describe your ideal work environment and work style preferences",
                        "What are your strongest skills - both technical and interpersonal?",
                        "What accomplishments are you proudest of, and what made them meaningful?",
                        "What past experiences (work, school, volunteer) felt most engaging?",
                        "What lifestyle factors influence your career choices? (location, schedule, travel, etc.)",
                        "Where do you see gaps in your current skillset you'd like to develop?"
                    ]
                },
                phase2: {
                    title: "Analysis",
                    transition: "Thank you for sharing so much detail. I can see some clear patterns emerging..."
                },
                phase3: {
                    title: "Career Recommendations",
                    introduction: "Based on your responses, here are personalized career recommendations:"
                },
                phase4: {
                    title: "Action Planning",
                    introduction: "Let's create your practical career development roadmap:"
                }
            },
            conversationTechniques: {
                activeListening: [
                    "It sounds like...",
                    "What I'm hearing is...",
                    "That's really interesting - can you tell me more about...",
                    "I can see why that would be important to you"
                ],
                uncertainty: [
                    "That's completely normal. Let's try a different approach...",
                    "If you had to choose between [A] and [B], which feels slightly more appealing?",
                    "Think about what you definitely DON'T want - sometimes that clarifies what you do want",
                    "Let's imagine you're talking to a friend in 5 years about your career - what would make you proud?"
                ]
            }
        };
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.restartButton = document.getElementById('restartButton');

        if (!this.chatMessages || !this.chatInput || !this.sendButton || !this.typingIndicator || !this.restartButton) {
            console.error('Required elements not found, retrying...');
            setTimeout(() => this.setupElements(), 100);
            return;
        }

        this.bindEvents();
        this.updateProgressIndicator();
    }

    bindEvents() {
        // Remove any existing event listeners
        this.sendButton.replaceWith(this.sendButton.cloneNode(true));
        this.sendButton = document.getElementById('sendButton');
        this.chatInput.replaceWith(this.chatInput.cloneNode(true));
        this.chatInput = document.getElementById('chatInput');
        this.restartButton.replaceWith(this.restartButton.cloneNode(true));
        this.restartButton = document.getElementById('restartButton');

        // Add event listeners
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.chatInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });

        this.restartButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.restartAssessment();
        });

        // Focus on input
        this.chatInput.focus();
    }

    adjustTextareaHeight() {
        if (!this.chatInput) return;
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    handleSendMessage() {
        if (!this.chatInput) return;
        
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Disable input while processing
        this.chatInput.disabled = true;
        this.sendButton.disabled = true;

        this.addUserMessage(message);
        this.userResponses.push({
            phase: this.currentPhase,
            questionIndex: this.currentQuestionIndex,
            response: message,
            timestamp: new Date()
        });

        this.chatInput.value = '';
        this.adjustTextareaHeight();
        
        // Process response after a short delay
        setTimeout(() => {
            this.processUserResponse(message);
            this.chatInput.disabled = false;
            this.sendButton.disabled = false;
            this.chatInput.focus();
        }, 500);
    }

    addUserMessage(message) {
        const messageElement = this.createMessageElement(message, 'user');
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addAIMessage(message, isSpecial = false) {
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            const messageElement = this.createMessageElement(message, 'ai', isSpecial);
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }, 1000 + Math.random() * 1000);
    }

    createMessageElement(content, type, isSpecial = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = type === 'ai' ? '🤖' : '👤';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        if (isSpecial) {
            bubbleDiv.innerHTML = content;
        } else {
            // Split content by line breaks and create proper HTML
            const lines = content.split('\n');
            bubbleDiv.innerHTML = lines.map(line => {
                if (line.trim() === '') return '<br>';
                // Handle bold text
                return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            }).join('<br>');
        }

        contentDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    showTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.classList.remove('hidden');
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.classList.add('hidden');
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.chatMessages) {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        }, 100);
    }

    processUserResponse(message) {
        const activeListening = this.getRandomActiveListening();
        
        if (this.currentPhase === 1) {
            // Phase 1: Assessment
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex < this.conversationData.phases.phase1.questions.length) {
                // Ask next question
                const nextQuestion = this.conversationData.phases.phase1.questions[this.currentQuestionIndex];
                this.addAIMessage(`${activeListening} ${nextQuestion}`);
            } else {
                // Move to Phase 2
                setTimeout(() => this.moveToPhase2(), 1500);
            }
        } else if (this.currentPhase === 2) {
            // Move to Phase 3
            setTimeout(() => this.moveToPhase3(), 1500);
        } else if (this.currentPhase === 3) {
            // Move to Phase 4
            setTimeout(() => this.moveToPhase4(), 1500);
        } else if (this.currentPhase === 4) {
            // End of assessment
            setTimeout(() => this.completeAssessment(), 1500);
        }
    }

    getRandomActiveListening() {
        const techniques = this.conversationData.conversationTechniques.activeListening;
        return techniques[Math.floor(Math.random() * techniques.length)];
    }

    moveToPhase2() {
        this.currentPhase = 2;
        this.updateProgressIndicator();
        
        const analysis = this.generateAnalysis();
        this.addAIMessage(`${this.conversationData.phases.phase2.transition}\n\n${analysis}`, true);
        
        setTimeout(() => {
            this.addAIMessage("What do you think of this analysis? Does it resonate with you?");
        }, 3000);
    }

    generateAnalysis() {
        const responses = this.userResponses;
        let coreDrivers = [];
        let strengths = [];
        
        // Simple keyword analysis for demonstration
        const responseText = responses.map(r => r.response.toLowerCase()).join(' ');
        
        // Analyze core drivers
        if (responseText.includes('creative') || responseText.includes('design') || responseText.includes('art')) {
            coreDrivers.push('Creative expression and innovation');
        }
        if (responseText.includes('help') || responseText.includes('people') || responseText.includes('team')) {
            coreDrivers.push('Making a positive impact on others');
        }
        if (responseText.includes('solve') || responseText.includes('problem') || responseText.includes('challenge')) {
            coreDrivers.push('Problem-solving and analytical thinking');
        }
        if (responseText.includes('stable') || responseText.includes('secure') || responseText.includes('balance')) {
            coreDrivers.push('Work-life balance and stability');
        }

        // Analyze strengths
        if (responseText.includes('communication') || responseText.includes('speaking') || responseText.includes('writing')) {
            strengths.push('Strong communication skills');
        }
        if (responseText.includes('leadership') || responseText.includes('manage') || responseText.includes('organize')) {
            strengths.push('Leadership and organizational abilities');
        }
        if (responseText.includes('technical') || responseText.includes('technology') || responseText.includes('software')) {
            strengths.push('Technical and analytical capabilities');
        }
        if (responseText.includes('collaborate') || responseText.includes('team') || responseText.includes('social')) {
            strengths.push('Collaboration and interpersonal skills');
        }

        // Default values if no specific patterns found
        if (coreDrivers.length === 0) coreDrivers = ['Professional growth and meaningful work', 'Building expertise in your field'];
        if (strengths.length === 0) strengths = ['Adaptability and learning agility', 'Strong work ethic and dedication'];

        return `<div class="analysis-section">
            <h4>Based on our conversation, here's what stands out:</h4>
            <div class="recommendation-section">
                <strong>Your core drivers:</strong> ${coreDrivers.join(', ')}
            </div>
            <div class="recommendation-section">
                <strong>Your natural strengths:</strong> ${strengths.join(', ')}
            </div>
            <div class="recommendation-section">
                <strong>Your ideal environment:</strong> A workplace that values growth, collaboration, and allows you to leverage your unique strengths
            </div>
            <div class="recommendation-section">
                <strong>Growth opportunities:</strong> Developing specialized skills in areas that align with your interests and market demand
            </div>
        </div>`;
    }

    moveToPhase3() {
        this.currentPhase = 3;
        this.updateProgressIndicator();
        
        const recommendations = this.generateCareerRecommendations();
        this.addAIMessage(`${this.conversationData.phases.phase3.introduction}\n\n${recommendations}`, true);
        
        setTimeout(() => {
            this.addAIMessage("Which of these career paths interests you most, or would you like me to elaborate on any specific recommendation?");
        }, 4000);
    }

    generateCareerRecommendations() {
        const responseText = this.userResponses.map(r => r.response.toLowerCase()).join(' ');
        const recommendations = [];

        // Simple career matching based on keywords
        if (responseText.includes('creative') || responseText.includes('design') || responseText.includes('marketing')) {
            recommendations.push({
                title: "UX/UI Designer",
                fitReason: "Your creative interests and desire to solve user problems align perfectly with UX design",
                responsibilities: "Design user interfaces, conduct user research, create wireframes and prototypes",
                currentSkills: "Creative thinking, problem-solving, attention to detail",
                skillsToDevelop: "Design software (Figma, Sketch), User research methods, Prototyping",
                growthPath: "Junior Designer → Senior Designer → Design Lead → Creative Director",
                challenges: "Keeping up with design trends and learning technical tools"
            });
        }

        if (responseText.includes('data') || responseText.includes('analyze') || responseText.includes('technical')) {
            recommendations.push({
                title: "Data Analyst",
                fitReason: "Your analytical mindset and interest in solving problems through data insights",
                responsibilities: "Collect and analyze data, create reports and dashboards, identify trends and insights",
                currentSkills: "Analytical thinking, attention to detail, problem-solving",
                skillsToDevelop: "SQL, Python/R, Data visualization tools (Tableau, Power BI)",
                growthPath: "Junior Analyst → Senior Analyst → Data Scientist → Analytics Manager",
                challenges: "Learning programming languages and statistical methods"
            });
        }

        if (responseText.includes('people') || responseText.includes('help') || responseText.includes('team')) {
            recommendations.push({
                title: "Project Manager",
                fitReason: "Your people skills and organizational abilities make you ideal for coordinating teams",
                responsibilities: "Plan and execute projects, coordinate team members, manage timelines and budgets",
                currentSkills: "Communication, organization, leadership potential",
                skillsToDevelop: "Project management methodologies (Agile, Scrum), PM software, Budget management",
                growthPath: "Junior PM → Senior PM → Program Manager → Director of Operations",
                challenges: "Managing competing priorities and stakeholder expectations"
            });
        }

        // Default recommendations if no specific patterns match
        if (recommendations.length === 0) {
            recommendations.push(
                {
                    title: "Product Manager",
                    fitReason: "Your combination of analytical and people skills suits product development",
                    responsibilities: "Define product strategy, work with engineering teams, analyze market needs",
                    currentSkills: "Strategic thinking, communication, problem-solving",
                    skillsToDevelop: "Product management frameworks, Data analysis, User research",
                    growthPath: "Associate PM → Product Manager → Senior PM → VP of Product",
                    challenges: "Balancing technical and business requirements"
                },
                {
                    title: "Marketing Coordinator",
                    fitReason: "Your communication skills and creative potential suit marketing roles",
                    responsibilities: "Develop marketing campaigns, create content, analyze campaign performance",
                    currentSkills: "Communication, creativity, organizational skills",
                    skillsToDevelop: "Digital marketing tools, Content creation, Analytics platforms",
                    growthPath: "Coordinator → Specialist → Manager → Director of Marketing",
                    challenges: "Keeping up with digital marketing trends and tools"
                }
            );
        }

        let html = '';
        recommendations.slice(0, 3).forEach((rec, index) => {
            html += `<div class="career-recommendation">
                <h4>Career Option ${index + 1}: ${rec.title}</h4>
                <div class="recommendation-section">
                    <strong>Perfect fit because:</strong> ${rec.fitReason}
                </div>
                <div class="recommendation-section">
                    <strong>What you'd do:</strong> ${rec.responsibilities}
                </div>
                <div class="recommendation-section">
                    <strong>Skills you have:</strong> ${rec.currentSkills}
                </div>
                <div class="recommendation-section">
                    <strong>Skills to develop:</strong> ${rec.skillsToDevelop}
                </div>
                <div class="recommendation-section">
                    <strong>Growth path:</strong> ${rec.growthPath}
                </div>
                <div class="recommendation-section">
                    <strong>Potential challenges:</strong> ${rec.challenges}
                </div>
            </div>`;
        });

        return html;
    }

    moveToPhase4() {
        this.currentPhase = 4;
        this.updateProgressIndicator();
        
        const actionPlan = this.generateActionPlan();
        this.addAIMessage(`${this.conversationData.phases.phase4.introduction}\n\n${actionPlan}`, true);
        
        setTimeout(() => {
            this.completeAssessment();
        }, 5000);
    }

    generateActionPlan() {
        return `<div class="action-plan">
            <h4>Your Personalized Career Development Roadmap</h4>
            
            <div class="action-timeline">
                <strong>Next 30 Days:</strong>
                <ul>
                    <li>Complete a skills assessment in your area of interest</li>
                    <li>Research 3-5 companies in your target field</li>
                    <li>Start building a professional portfolio or updating your LinkedIn profile</li>
                    <li>Connect with 2-3 professionals in your field of interest for informational interviews</li>
                </ul>
            </div>

            <div class="action-timeline">
                <strong>3-6 Months:</strong>
                <ul>
                    <li>Complete an online course or certification in a key skill area</li>
                    <li>Start a personal project that demonstrates your capabilities</li>
                    <li>Attend industry networking events or join professional associations</li>
                    <li>Apply for relevant positions or internships to gain experience</li>
                </ul>
            </div>

            <div class="action-timeline">
                <strong>Resources to Explore:</strong>
                <ul>
                    <li>Coursera, edX, or Udemy for skill development courses</li>
                    <li>LinkedIn Learning for professional development</li>
                    <li>Industry-specific communities and forums</li>
                    <li>Local professional meetups and networking groups</li>
                </ul>
            </div>

            <div class="action-timeline">
                <strong>Testing These Careers:</strong>
                <ul>
                    <li>Volunteer for projects that use relevant skills</li>
                    <li>Shadow professionals in your fields of interest</li>
                    <li>Take on freelance projects to build experience</li>
                    <li>Participate in industry challenges or hackathons</li>
                </ul>
            </div>
        </div>`;
    }

    completeAssessment() {
        const summary = this.generateFinalSummary();
        this.addAIMessage(summary, true);
        
        setTimeout(() => {
            this.addAIMessage("Remember, career development is a journey of exploration and growth. These recommendations are starting points - trust the process and take action to gain clarity. You have valuable strengths and potential. Would you like to start a new assessment or have any questions about your results?");
        }, 3000);
    }

    generateFinalSummary() {
        const responseText = this.userResponses.map(r => r.response.toLowerCase()).join(' ');
        
        let profile = "Professional seeking meaningful work that leverages your unique strengths";
        let topPaths = [
            "UX/UI Designer - Perfect blend of creativity and problem-solving",
            "Project Manager - Leverages your people skills and organizational abilities", 
            "Data Analyst - Matches your analytical mindset and technical interests"
        ];
        
        if (responseText.includes('creative')) {
            profile = "Creative professional with strong problem-solving abilities";
        } else if (responseText.includes('technical') || responseText.includes('data')) {
            profile = "Analytically-minded professional with technical aptitude";
        } else if (responseText.includes('people') || responseText.includes('help')) {
            profile = "People-focused professional with natural leadership qualities";
        }

        return `<div class="analysis-section">
            <h4>🎉 Your Career Guidance Summary</h4>
            
            <div class="recommendation-section">
                <strong>Your Career Profile:</strong> ${profile}
            </div>
            
            <div class="recommendation-section">
                <strong>Top Recommended Paths:</strong>
                <ol>
                    ${topPaths.map(path => `<li>${path}</li>`).join('')}
                </ol>
            </div>
            
            <div class="recommendation-section">
                <strong>Your Immediate Next Step:</strong> Research and connect with professionals in your top choice field this week
            </div>
            
            <div class="recommendation-section">
                <strong>30-Day Goal:</strong> Complete a relevant online course or certification to build credibility in your chosen path
            </div>
        </div>`;
    }

    updateProgressIndicator() {
        const steps = document.querySelectorAll('.progress-step');
        
        steps.forEach((step, index) => {
            const phaseNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (phaseNum < this.currentPhase) {
                step.classList.add('completed');
            } else if (phaseNum === this.currentPhase) {
                step.classList.add('active');
            }
        });
    }

    restartAssessment() {
        if (confirm('Are you sure you want to start a new assessment? This will clear all your current progress.')) {
            // Clear all data
            this.currentPhase = 1;
            this.currentQuestionIndex = 0;
            this.userResponses = [];
            
            // Clear chat messages except the initial one
            this.chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="message-bubble">
                            Hi! I'm CareerCoach AI, and I'm here to help you discover career paths that truly fit who you are. We'll spend about 15-20 minutes exploring your values, strengths, and preferences, then I'll provide personalized career recommendations with actionable next steps. Ready to begin?<br><br>Let's start with what drives you: <strong>What energizes you most - what activities or types of work make you feel excited and engaged?</strong>
                        </div>
                    </div>
                </div>
            `;
            
            // Reset progress indicator
            this.updateProgressIndicator();
            
            // Reset input
            this.chatInput.value = '';
            this.adjustTextareaHeight();
            this.chatInput.focus();
            
            // Scroll to top
            this.chatMessages.scrollTop = 0;
        }
    }
}

// Initialize the application
let careerCoachApp;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        careerCoachApp = new CareerCoachAI();
    });
} else {
    careerCoachApp = new CareerCoachAI();
}