// Utility to create a question block with pre-filled values
function createQuestionBlockWithData(idx, data) {
    return `
    <div class="question-block" data-idx="${idx}">
        <label>Question: <input type="text" class="question-text" required value="${data.questionText || ''}"></label><br>
        <label>Option A: <input type="text" class="optionA" required value="${data.optionA || ''}"></label><br>
        <label>Option B: <input type="text" class="optionB" required value="${data.optionB || ''}"></label><br>
        <label>Option C: <input type="text" class="optionC" required value="${data.optionC || ''}"></label><br>
        <label>Option D: <input type="text" class="optionD" required value="${data.optionD || ''}"></label><br>
        <label>Correct Answer:
            <select class="correct-answer" required>
                <option value="A" ${data.correctAnswer === data.optionA ? 'selected' : ''}>A</option>
                <option value="B" ${data.correctAnswer === data.optionB ? 'selected' : ''}>B</option>
                <option value="C" ${data.correctAnswer === data.optionC ? 'selected' : ''}>C</option>
                <option value="D" ${data.correctAnswer === data.optionD ? 'selected' : ''}>D</option>
            </select>
        </label>
        <button type="button" class="remove-question-btn">Remove</button>
        <hr>
    </div>
    `;
}
