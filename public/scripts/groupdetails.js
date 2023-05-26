$(document).ready(function () {
    $("button.removeMember").click(function () {
        // activate remove member modal
        var memberEmail = $(this).attr("id");
        var memberName = $(this).attr("memberName");
        $("#modal-title-remove").text("Remove " + memberName + " from the group?");
        $("#modal-body-remove").html(`
            <p>${memberName} will lose access to the group's itinerary plan and chatroom history!</p>
            <input type="hidden" name="memberEmail" id="memberEmail" value="${memberEmail}">
            `);
    });
});