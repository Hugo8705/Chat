var socket = io.connect('http://localhost:7076');

$(document).ready(function() {

		// Mise à jour status du client
		changeStatus();

		// Nouvelle connexion
		newConnexion();

		// Fermeture connexion
		endConnexion();

		// Changement de pseudo
		aPseudoChanged();

		// Envoi Message
		$('#envoyerMessage').on('click', message);

		// Diffusion Message
		messageDisplay();

		// Changement pseudo
		$('#changerPseudo').on('click', setPseudo);

});

function changeStatus() {
		
		socket.on('message', function(message) {
				$('#status').html("Votre status : " + message);
		})

}

function setPseudo(event) {

		event.preventDefault();

		if($('#inputClientPseudo').val() != '') {
				var newPseudo = $('#inputClientPseudo').val();
				var oldPseudo = $('#spanPseudoClient').text();
				$('#spanPseudoClient').text(newPseudo);
				$('#inputClientPseudo').val('');

				//on emet l'evenement pour mettre à jour le pseudo
				socket.emit('pseudoChanged', {newPseudo : newPseudo, oldPseudo : oldPseudo});
		}	

}

function aPseudoChanged() {

		socket.on('aPseudoChanged', function(data) {
				var contenu = "<p>" + data.oldPseudo + " s'appelle désormais " + data.newPseudo + "</p>";
				$('#messages').append(contenu);
		})

}

function newConnexion() {
		
		socket.on('newConnexion', function(message) {
				
				$('#nbrConnexion').html("Nombre de personnes connectées : " + message.compteur);
				
				$('#spanPseudoClient').text(message.pseudo);
				var contenu = "<p>" + message.pseudo + " s'est connecté.</p>";
				$('#messages').append(contenu);
				
				var contenuListe;

				$.each( message.listeUtilisateurs, function( i, val ) {
					if(val !== null) {
						contenuListe += "<p id='" + i + "'>" + val + "</p>";
					}
				});

				$('#listeUsers').html(contenuListe);
		})

}

function endConnexion() {
		
		socket.on('endConnexion', function(message) {
				$('#nbrConnexion').html("Nombre de personnes connectées : " + message.compteur);
				var contenu = "<p>" + message.pseudo + " s'est déconnecté.</p>";
				$('#messages').append(contenu);
				
				var contenuListe;

				$.each( message.listeUtilisateurs, function( i, val ) {
					if(val !== null) {
					contenuListe += "<p id='" + i + "'>" + val + "</p>";
					}
				});

				$('#listeUsers').html(contenuListe);
		})

}

function message(event) {
		
		event.preventDefault();

		if($('#clientMessage').val() != '') {
				var messageClient = $('#clientMessage').val();
				$('#clientMessage').val('')
				//on emet l'evenement pour mettre à jour le pseudo
				socket.emit('messageSent', messageClient);
		}	

}


function messageDisplay() {

		socket.on('messageBroadcast', function(data) {
				var contenu = "<p>" + data.user + " dit : " + data.message + "</p>";
				$('#messages').append(contenu);
		})

}
